import { Engine, Move, Pair, Score, Side5 } from '../type/snakepony'
import { SnakeponyConfig } from '../type/snakeponyConfig'
import { createArray2d } from '../util/array2d'
import { getContext2d } from '../util/getContext2d'
import { NoisyState } from '../util/noisyState'
import { lightGrey, white, black } from './color'
import { getDelta, getSide, getReverse } from '../util/direction'
import { pairAdd, pairEqual } from '../util/pair'

// Display interface
export interface DisplayProp {
   canvas: HTMLCanvasElement
   config: SnakeponyConfig
   engine: Engine
   screenSize: ScreenSize
}

export type ScreenSize = NoisyState<Pair>

export type Display = void

// Display state - Square, grid
export type DisplaySquare = DisplayPattern[]

export type DisplayPattern = FoodPattern | BodyPattern

export interface FoodPattern {
   type: 'food'
}

export interface BodyPattern {
   type: 'body'
   from: Side5
   to: Side5
}

// Display state - Body
export type DisplayBody = Move[]

export let createDisplay = (prop: DisplayProp): Display => {
   let { canvas, config, engine, screenSize } = prop
   let ctx = getContext2d(canvas)

   // State
   let tailPos: Pair = engine.getTail()
   let headPos = { ...tailPos }
   let grid = createArray2d<DisplaySquare>(config.gridSize, (pos) =>
      pairEqual(pos, headPos)
         ? [
              {
                 type: 'body',
                 from: 'right',
                 to: 'right',
              },
           ]
         : [],
   )
   let body: DisplayBody = []

   let lastFoodPosition: Pair = { x: 0, y: 0 }

   let squareSize: number
   let bodyThickeness: number
   let bodyOffset: number
   let foodSize: number
   let foodOffset: number
   let gridRightSide: number
   let gridBottom: number

   const GAME_RIGHT_SIDE_PANEL = 120
   const PAGE_TOP_OFFSET = 80
   const PAGE_RIGHT_OFFSET = 24

   let resizeLayout = (window: Pair) => {
      let canvasSize = {
         x: Math.max(window.x - PAGE_RIGHT_OFFSET, 64 + GAME_RIGHT_SIDE_PANEL),
         y: Math.max(window.y - PAGE_TOP_OFFSET, 64),
      }
      let available = {
         x: canvasSize.x - GAME_RIGHT_SIDE_PANEL,
         y: canvasSize.y,
      }
      if (available.x * config.gridSize.y > available.y * config.gridSize.x) {
         // The constraint is vertical space
         // Size is decided according to window.y
         squareSize = 2 * Math.floor(available.y / (2 * config.gridSize.y))
      } else {
         // The constraint is horizontal space
         // Size is decided according to window.x
         squareSize = 2 * Math.floor(available.x / (2 * config.gridSize.x))
      }

      bodyThickeness = 2 * Math.ceil(squareSize / 2 / 5)
      bodyOffset = squareSize / 2 - bodyThickeness / 2
      foodSize = 2 * Math.ceil((squareSize / 2) * 0.7)
      foodOffset = squareSize / 2 - foodSize / 2

      gridRightSide = config.gridSize.x * squareSize
      gridBottom = config.gridSize.y * squareSize

      canvas.height = canvasSize.y
      canvas.width = canvasSize.x
   }

   let renderScreen = () => {
      renderBackground()
      renderGrid()
      renderScore(engine.score.read())
   }

   let renderBackground = () => {
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
   }

   let renderGrid = () => {
      grid.forEach((line, ky) => {
         line.forEach((square, kx) => {
            renderSquare(square, { y: ky, x: kx })
         })
      })
   }

   let renderSquare = (square: DisplaySquare, pair: Pair) => {
      let x = squareSize * pair.x
      let y = squareSize * pair.y

      // Square background
      if ((pair.x + pair.y) % 2 == 0) {
         ctx.fillStyle = '#222'
      } else {
         ctx.fillStyle = '#000'
      }
      ctx.fillRect(x, y, squareSize, squareSize)

      square.forEach((pattern) => {
         if (pattern.type === 'food') {
            renderFood(pair)
         } else {
            renderBody(pair, pattern.from)
            renderBody(pair, pattern.to)
         }
      })
   }

   let renderFood = (pair: Pair) => {
      let x = squareSize * pair.x + foodOffset
      let y = squareSize * pair.y + foodOffset

      ctx.fillStyle = white
      ctx.fillRect(x, y, foodSize, foodSize)
   }

   let renderBody = (pair: Pair, pattern: Side5) => {
      let x = squareSize * pair.x + bodyOffset
      let y = squareSize * pair.y + bodyOffset
      let w = bodyThickeness
      let h = bodyThickeness

      if (pattern === 'nowhere') {
      } else if (pattern === 'top') {
         h += bodyOffset
         y -= bodyOffset
      } else if (pattern === 'bottom') {
         h += bodyOffset
      } else if (pattern === 'left') {
         w += bodyOffset
         x -= bodyOffset
      } else if (pattern === 'right') {
         w += bodyOffset
      }

      ctx.fillStyle = lightGrey
      ctx.fillRect(x, y, w, h)
   }

   let renderScore = (score: Score) => {
      if (score <= 2) {
         return
      }
      ctx.fillStyle = black
      ctx.fillRect(gridRightSide, 0, canvas.width, canvas.height)

      let x = gridRightSide + 30
      let y = 50
      let scale = 1

      let FONT_FAMILY = "SquareFont, 'Courier New', Courier, monospace"
      ctx.font = `${32 * scale}px ${FONT_FAMILY}`
      ctx.fillStyle = 'white'
      ctx.strokeStyle = 'black'

      let text = `${score}`
      ctx.lineWidth = 5
      ctx.strokeText(text, x, y)
      ctx.fillText(text, x, y)
   }

   //
   // Subscribtions
   //
   engine.add.subscribe((move) => {
      if (move.type == 'walk') {
         body.push(move)

         let delta = getDelta(move.direction)
         let side = getSide(move.direction)
         let reverseSide = getReverse(side)

         let newHeadPos = pairAdd(headPos, delta)

         let headSquare = grid[headPos.y][headPos.x]
         let newHeadSquare = grid[newHeadPos.y][newHeadPos.x]

         let headPattern = headSquare.slice(-1)[0]
         if (headPattern.type === 'body') {
            headPattern.to = side
         }

         newHeadSquare.push({
            type: 'body',
            from: reverseSide,
            to: 'nowhere',
         })

         renderSquare(headSquare, headPos)
         renderSquare(newHeadSquare, newHeadPos)

         headPos = newHeadPos
      } else {
         throw new Error()
      }
   })
   engine.remove.subscribe(() => {
      let move = body.shift()
      if (move === undefined || move.type !== 'walk') {
         throw new Error()
      }

      if (move.type === 'walk') {
         let delta = getDelta(move.direction)
         let newTailPos = pairAdd(tailPos, delta)

         let tailSquare = grid[tailPos.y][tailPos.x]
         let newTailSquare = grid[newTailPos.y][newTailPos.x]

         tailSquare.shift()

         let newTailPattern = newTailSquare.slice(-1)[0]
         if (newTailPattern === undefined) {
            console.log('newTailSquare', newTailSquare)
         } else if (newTailPattern.type === 'body') {
            newTailPattern.from = 'nowhere'
         }

         renderSquare(tailSquare, tailPos)
         renderSquare(newTailSquare, newTailPos)

         tailPos = newTailPos
      }
   })
   screenSize.attach((size) => {
      resizeLayout(size)
      renderScreen()
   })

   // Score
   engine.score.attach((score) => {
      renderScore(score)
   })

   // Food
   engine.food.subscribe((food) => {
      let last = lastFoodPosition
      let lastSquare = grid[last.y][last.x]
      let foodSquare = grid[food.y][food.x]

      for (let k = lastSquare.length - 1; k >= 0; k--) {
         if (lastSquare[k].type === 'food') {
            lastSquare.splice(k, 1)
         }
      }

      foodSquare.push({ type: 'food' })

      renderSquare(lastSquare, last)
      renderSquare(foodSquare, food)
      lastFoodPosition = food
   })
}
