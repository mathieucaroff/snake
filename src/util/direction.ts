import { Direction, Pair, Side, JumpDirection } from '../type/snakepony'

export let getDelta = (direction: Direction): Pair => {
   switch (direction) {
      case 'left':
         return { x: -1, y: 0 }
      case 'right':
         return { x: 1, y: 0 }
      case 'up':
         return { x: 0, y: -1 }
      case 'down':
         return { x: 0, y: 1 }
   }
}

export let getSide = (direction: JumpDirection): Side => {
   switch (direction) {
      case 'up':
         return 'top'
      case 'down':
         return 'bottom'
      case 'left':
      case 'right':
         return direction
   }
   throw new Error()
}

export let getReverse = (side: Side): Side => {
   switch (side) {
      case 'top':
         return 'bottom'
      case 'bottom':
         return 'top'
      case 'left':
         return 'right'
      case 'right':
         return 'left'
   }
}
