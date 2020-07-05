import { default as seedrandom } from 'seedrandom'
import { createEngine } from './core/engine'
import { createDisplay } from './display/display'
import { createInput } from './input/input'
import { init } from './page/init'
import { entries } from './util/entries'
import { spacelessURL } from './util/urlParam'

export let main = async () => {
   spacelessURL(location)

   let { canvas, config, screenSize } = init({ document, location })

   let random = seedrandom(config.seed)

   let input = createInput()

   let gridSize = {
      x: config.sizeX,
      y: config.sizeY,
   }

   let topology = {
      leftRight: config.topologyLeftRight,
      topBottom: config.topologyTopBottom,
   }

   let engine = createEngine({
      feed: config.feed,
      gridSize,
      random,
      topology,
   })

   entries(input.directive).forEach(([name, observable]) => {
      observable.subscribe(engine.move[name])
   })

   let display = createDisplay({
      canvas,
      gridSize,
      tailPosition: engine.getTail(),
      topology,
   })

   // Connecting modules
   engine.add.subscribe(display.add)
   engine.remove.subscribe(display.remove)
   engine.food.attach(display.handleFood)
   engine.score.attach(display.handleScore)

   screenSize.attach((size) => display.resizeScreen(size, engine.score.read()))

   engine.flushInit()
}
