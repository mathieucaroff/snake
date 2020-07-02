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
      input,
      random,
   })

   createDisplay({ canvas, config, screenSize, engine })

   engine.flushInit()
}
