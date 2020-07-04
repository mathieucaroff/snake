import { default as seedrandom } from 'seedrandom'
import { createEngine } from './core/engine'
import { createDisplay } from './display/display'
import { createInput } from './input/input'
import { init } from './page/init'
import { spacelessURL } from './util/urlParam'

export let main = async () => {
   spacelessURL(location)

   let { canvas, config, screenSize } = init({ document, location })

   let random = seedrandom(config.seed)

   let input = createInput()

   let engine = createEngine({
      config,
      random,
   })

   input.left.subscribe(engine.move.left)
   input.right.subscribe(engine.move.right)
   input.up.subscribe(engine.move.up)
   input.down.subscribe(engine.move.down)

   let display = createDisplay({ canvas, config, tailPosition: engine.getTail() })

   // Connecting modules
   engine.add.subscribe(display.add)
   engine.remove.subscribe(display.remove)
   engine.food.subscribe(display.handleFood)
   engine.score.attach(display.handleScore)

   screenSize.attach((size) => display.resizeScreen(size, engine.score.read()))

   engine.flushInit()
}
