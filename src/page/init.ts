import { fromEvent } from 'rxjs'
import { repository } from '../../package.json'
import { githubCornerHTML } from '../lib/githubCorner'
import { SnakeponyConfig } from '../type/snakeponyConfig'
import { createNoisyStateWithObservable } from '../util/noisyState'
import { randomSeed } from '../util/randomSeed'
import { getUrlParam } from '../util/urlParam'
import { h } from './lib/hyper'
import { ScreenSize } from '../type/snakepony'
import { topologyFromName } from '../util/topology'

interface InitProp {
   document: Document
   location: Location
}

let getConfig = (prop: InitProp) => {
   let { location } = prop

   let config = getUrlParam<SnakeponyConfig>(location, {
      feed: () => 1,
      size: () => 8,
      sizeY: ({ size }) => size(),
      sizeX: ({ size }) => Math.floor(1.5 * size()),
      seed: () => randomSeed(),
      showMoveCount: () => false,
      topology: () => 'rectangle',
      topologyLeftRight: ({ topology }) => topologyFromName(topology())?.leftRight ?? 'wall',
      topologyTopBottom: ({ topology }) => topologyFromName(topology())?.topBottom ?? 'wall',
      ai: () => 'none',
      aiSpeed: () => 10,
   })

   console.info(`?seed=${config.seed}`)

   return config
}

export let init = (prop: InitProp) => {
   let { document } = prop
   let config = getConfig(prop)

   let canvas = h('canvas')
   canvas.width = 800
   canvas.height = 600

   let corner = h('i', {
      innerHTML: githubCornerHTML(repository),
   })

   document.body.append(
      h('h1', {
         textContent: document.title,
         className: 'inline',
      }),
      h('div', {}, [canvas]),
      corner,
   )

   let screenSize: ScreenSize = createNoisyStateWithObservable(fromEvent(window, 'resize'))(() => ({
      y: window.innerHeight,
      x: window.innerWidth,
   }))

   return {
      canvas,
      config,
      screenSize,
   }
}
