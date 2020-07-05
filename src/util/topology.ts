import { Topology2D } from '../type/snakepony'

let getTopologyName = (topology: Topology2D) => {
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
      return 'real projective plan'
   } else if (border == 0) {
      // => loop == 1 && crossed == 1
      return 'klein bottle'
   } else if (loop == 0) {
      // => _
      return 'möbius strip'
   } else if (crossed == 0) {
      // => _
      return 'ribbon'
   } else {
      throw new Error()
   }
}

export type TopologyName = ReturnType<typeof getTopologyName>

let exampleTopologyFromName = (name: TopologyName): Topology2D => {
   switch (name) {
      case 'rectangle':
         return { leftRight: 'wall', topBottom: 'wall' }
      case 'torus':
         return { leftRight: 'loop', topBottom: 'loop' }
      case 'real projective plan':
         return { leftRight: 'crossed', topBottom: 'crossed' }
      case 'klein bottle':
         return { leftRight: 'loop', topBottom: 'crossed' }
      case 'möbius strip':
         return { leftRight: 'wall', topBottom: 'crossed' }
      case 'ribbon':
         return { leftRight: 'wall', topBottom: 'loop' }
   }
}
