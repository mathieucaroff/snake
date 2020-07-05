import { Display, DisplayProp, DisplaySquare, Move, Pair, Score, Side5 } from '../type/snakepony'
import { createArray2d } from '../util/array2d'
import { getDelta, getReverse5, getSide5 } from '../util/direction'
import { getContext2d } from '../util/getContext2d'
import { pairAdd, pairEqual } from '../util/pair'
import { black, lightGrey, white, darkCoal } from './color'

// Display state - Body
export type DisplayBody = Move[]

export let createDisplay = (prop: DisplayProp): Display => {
   let { canvas, gridSize, showMoveCount, tailPosition: tailPos, topology } = prop
   let ctx = getContext2d(canvas)

   // State
   let headPos = { ...tailPos }
   let grid = createArray2d<DisplaySquare>(gridSize, (pos) =>
      pairEqual(pos, headPos)
         ? [
              {
                 type: 'body',
                 from: 'nowhere',
                 to: 'nowhere',
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
   let boardRightSide: number
   let boardBottom: number

   let GAME_RIGHT_SIDE_PANEL = 120
   let GAME_BORDER_X = 1
   let GAME_BORDER_Y = 1
   let PAGE_TOP_OFFSET = 80
   let PAGE_RIGHT_OFFSET = 24

   let resizeLayout = (window: Pair) => {
      let canvasSize = {
         x: Math.max(window.x - PAGE_RIGHT_OFFSET, 64 + GAME_RIGHT_SIDE_PANEL),
         y: Math.max(window.y - PAGE_TOP_OFFSET, 64),
      }

      let available = {
         x: canvasSize.x - GAME_RIGHT_SIDE_PANEL - 2 * GAME_BORDER_X,
         y: canvasSize.y - 2 * GAME_BORDER_Y,
      }

      if (available.x * gridSize.y > available.y * gridSize.x) {
         // The constraint is vertical space
         // Size is decided according to available.y
         squareSize = 2 * Math.floor(available.y / (2 * gridSize.y))
      } else {
         // The constraint is horizontal space
         // Size is decided according to available.x
         squareSize = 2 * Math.floor(available.x / (2 * gridSize.x))
      }

      bodyThickeness = 2 * Math.ceil(squareSize / 2 / 5)
      bodyOffset = squareSize / 2 - bodyThickeness / 2
      foodSize = 2 * Math.ceil((squareSize / 2) * 0.7)
      foodOffset = squareSize / 2 - foodSize / 2

      boardRightSide = gridSize.x * squareSize + 2 * GAME_BORDER_X
      boardBottom = gridSize.y * squareSize + 2 * GAME_BORDER_Y

      canvas.height = canvasSize.y
      canvas.width = canvasSize.x
   }

   let renderScreen = (score: Score) => {
      renderBackground()
      renderGrid()
      renderScore(score)
   }

   let renderBackground = () => {
      // Black base
      ctx.fillStyle = black
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Grey Border
      let x = 0
      let y = 0
      let w = boardRightSide
      let h = boardBottom
      if (topology.leftRight !== 'wall') {
         x += GAME_BORDER_X
         w -= 2 * GAME_BORDER_X
      }
      if (topology.topBottom !== 'wall') {
         y += GAME_BORDER_Y
         h -= 2 * GAME_BORDER_Y
      }
      ctx.fillStyle = lightGrey
      ctx.fillRect(x, y, w, h)
   }

   let renderGrid = () => {
      grid.forEach((line, ky) => {
         line.forEach((square, kx) => {
            renderSquare(square, { y: ky, x: kx })
         })
      })
   }

   let renderSquare = (square: DisplaySquare, pair: Pair) => {
      let x = GAME_BORDER_X + squareSize * pair.x
      let y = GAME_BORDER_Y + squareSize * pair.y

      // Square background
      if ((pair.x + pair.y) % 2 == 0) {
         ctx.fillStyle = darkCoal
      } else {
         ctx.fillStyle = black
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

   /**
    * renderBody -- render a piece of body of the snake
    * @param pos where to render the pattern
    * @param pattern what to render
    */
   let renderBody = (pos: Pair, pattern: Side5) => {
      let x = GAME_BORDER_X + squareSize * pos.x + bodyOffset
      let y = GAME_BORDER_Y + squareSize * pos.y + bodyOffset
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
      if (score.moveCount <= 0) {
         return
      }
      ctx.fillStyle = black
      ctx.fillRect(boardRightSide, 0, canvas.width, canvas.height)

      let x = boardRightSide + 30
      let y = 50
      let scale = 1

      let FONT_FAMILY = "SquareFont, 'Courier New', Courier, monospace"
      ctx.font = `${32 * scale}px ${FONT_FAMILY}`
      ctx.fillStyle = 'white'
      ctx.strokeStyle = 'black'

      displayText(`${score.snakeSize}`, { x, y })
      let yMove = Math.max(boardBottom - 60, y + 48)
      if (showMoveCount) {
         displayText(`${score.moveCount}`, { x, y: yMove })
      }
   }

   let displayText = (text: string, pos: Pair) => {
      ctx.lineWidth = 5
      ctx.strokeText(text, pos.x, pos.y)
      ctx.fillText(text, pos.x, pos.y)
   }

   //
   // Subscriptions
   //
   let add = (move: Move): void => {
      body.push(move)

      let newHeadPos: Pair

      if (move.type === 'walk') {
         newHeadPos = pairAdd(headPos, getDelta(move.direction))
      } else {
         newHeadPos = move.destination
      }

      let headSquare = grid[headPos.y][headPos.x]
      let newHeadSquare = grid[newHeadPos.y][newHeadPos.x]

      let side = getSide5(move.direction)
      let reversedSide = getReverse5(side)

      let headPattern = headSquare.slice(-1)[0]
      if (headPattern.type === 'body') {
         headPattern.to = side
      }

      newHeadSquare.push({
         type: 'body',
         from: reversedSide,
         to: 'nowhere',
      })

      renderSquare(headSquare, headPos)
      renderSquare(newHeadSquare, newHeadPos)

      headPos = newHeadPos
   }

   let remove = () => {
      let move = body.shift()
      if (move === undefined) {
         throw new Error()
      }

      let newTailPos: Pair

      if (move.type === 'walk') {
         newTailPos = pairAdd(tailPos, getDelta(move.direction))
      } else {
         newTailPos = move.destination
      }

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

   let resizeScreen = (size: Pair, score: Score): void => {
      resizeLayout(size)
      renderScreen(score)
   }

   // Score
   let handleScore = (score: Score): void => {
      renderScore(score)
   }

   // Food
   let handleFood = (food) => {
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
   }

   return {
      add,
      remove,
      resizeScreen,
      handleScore,
      handleFood,
   }
}
