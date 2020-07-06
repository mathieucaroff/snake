import { Topology2D } from '../type/snakepony'

export let getTopologyName = (topology: Topology2D) => {
   let border = 0
   let loop = 0
   let crossed = 0

   let topology1DArray = Object.values(topology)

   if (topology1DArray.length !== 2) {
      throw new Error()
   }

   topology1DArray.forEach((value) => {
      switch (value) {
         case 'wall':
            return border++
         case 'loop':
            return loop++
         case 'crossed':
            return crossed++
      }
   })

   if (false) {
   } else if (border == 2) {
      return 'rectangle'
   } else if (loop == 2) {
      return 'torus'
   } else if (crossed == 2) {
      return 'projective' // 'real projective plan'
   } else if (border == 0) {
      // => loop == 1 && crossed == 1
      return 'klein' // 'klein bottle'
   } else if (loop == 0) {
      // => _
      return 'mobius' // 'möbius strip'
   } else if (crossed == 0) {
      // => _
      return 'ribbon'
   } else {
      throw new Error()
   }
}

export type TopologyName = ReturnType<typeof getTopologyName>

export let topologyFromName = (name: string): Topology2D | undefined => {
   let topology: Topology2D | undefined = undefined

   if (false) {
   } else if (name.match(/\b(rect|square|normal|wall)/)) {
      topology = { leftRight: 'wall', topBottom: 'wall' }
   } else if (name.match(/\btorus/)) {
      topology = { leftRight: 'loop', topBottom: 'loop' }
   } else if (name.match(/\b(real|projective|plan)/)) {
      topology = { leftRight: 'crossed', topBottom: 'crossed' }
   } else if (name.match(/\b(klein|bottle)/)) {
      topology = { leftRight: 'loop', topBottom: 'crossed' }
   } else if (name.match(/\b(m..?bius|strip)/)) {
      topology = { leftRight: 'wall', topBottom: 'crossed' }
   } else if (name.match(/\b(ribbon|loop)/)) {
      topology = { leftRight: 'wall', topBottom: 'loop' }
   }

   if (topology === undefined) {
      return
   }

   if (name.match(/\b(long|alt)/)) {
      topology = {
         leftRight: topology.topBottom,
         topBottom: topology.leftRight,
      }
   }

   return topology
}
