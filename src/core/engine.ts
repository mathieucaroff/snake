import { Subject } from 'rxjs'

import { Direction, Engine, EngineProp, Move, Pair, Player, Score } from '../type/snakepony'
import { createArray2d } from '../util/array2d'
import { getDelta } from '../util/direction'
import { createNoisyState, NoisyState } from '../util/noisyState'
import { pairAdd, pairEqual } from '../util/pair'
import { mod } from '../util/mod'

export let createEngine = (prop: EngineProp) => {
   let { gridSize, topology, random } = prop

   let gridSquareNumber = gridSize.x * gridSize.y

   let grid = createArray2d(gridSize, () => 0)

   let player: Player = {
      body: [{ x: 2, y: 2 }],
   }

   grid[player.body[0].y][player.body[0].x]++

   let headSubject = new Subject<Move>()
   let tailSubject = new Subject<void>()
   let score: NoisyState<Score> = createNoisyState(1)
   let food: NoisyState<Pair> = createNoisyState(pairAdd(player.body[0], { x: 1, y: 0 }))

   /**
    * move
    * Let the player do a move
    *
    * @param direction
    */
   let move = (direction: Direction) => {
      //  The delta Pair that leads the player to an odd wall
      let delta = getDelta(direction)

      let newHead = pairAdd(player.body.slice(-1)[0], delta)
      let { y, x } = newHead
      let jumping = false

      // // collision // //
      // self collision
      // top-bottom border
      if (y < 0 || y >= gridSize.y) {
         if (topology.topBottom === 'wall') {
            return
         } else {
            jumping = true

            newHead.y = mod(y, gridSize.y)
            if (topology.topBottom === 'crossed') {
               newHead.x = gridSize.x - 1 - x
            }
         }
      }
      if (x < 0 || x >= gridSize.x) {
         if (topology.leftRight === 'wall') {
            return
         } else {
            jumping = true

            newHead.x = mod(x, gridSize.x)
            if (topology.leftRight === 'crossed') {
               newHead.y = gridSize.y - 1 - y
            }
         }
      }

      if (grid[newHead.y][newHead.x] > 0) {
         return
      }

      // food
      let scoring = pairEqual(food.read(), newHead)

      // moving tail
      if (!scoring) {
         let tail = player.body[0]
         grid[tail.y][tail.x] -= 1
         player.body.shift()
         tailSubject.next()
      }

      // moving head
      grid[newHead.y][newHead.x] += 1
      player.body.push(newHead)

      if (jumping) {
         console.log(newHead)

         headSubject.next({
            type: 'jump',
            direction,
            destination: newHead,
         })
      } else {
         headSubject.next({
            type: 'walk',
            direction,
         })
      }

      // moving the food
      if (scoring) {
         score.write(score.read() + 1)
         food.write(randomFoodPosition())
      }
   }

   let getTail = () => {
      return player.body[0]
   }

   let randomFoodPosition = (): Pair => {
      let optionCount = gridSquareNumber - player.body.length
      let index = Math.floor(random() * optionCount) % optionCount
      let foodPosition: any

      let count = 0
      let reached = grid.some((line, ky) =>
         line.some((square, kx) => {
            if (square == 0) {
               // Counting empty squares
               count++
            }
            if (count > index) {
               // Until one reaches index
               foodPosition = { y: ky, x: kx }
               return true
            }
            return false
         }),
      )

      if (!reached || foodPosition === undefined) {
         throw new Error() // Impossible in theory
      }

      return foodPosition
   }

   let flushInit = () => {
      move('right')
   }

   let me: Engine = {
      add: headSubject,
      remove: tailSubject,
      score,
      food,
      getTail,
      flushInit,
      move: {
         left: () => move('left'),
         right: () => move('right'),
         up: () => move('up'),
         down: () => move('down'),
      },
   }

   return me
}
