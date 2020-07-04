import { Observable } from 'rxjs'

import { prng } from '../lib/seedrandom'
import { NoisyState } from '../util/noisyState'
import { SnakeponyConfig } from './snakeponyConfig'

// // //
// Module types
// Types that each correspond to some of Snakepony's internal modules
// // //

/**
 * PonyInput -- unified representation of the user's will to go in some
 * direction
 */
export type PonyInput = {
   [k in Direction]: Observable<void>
} & {
   removeAll: () => void
}

/**
 * EngineProp -- the values consumed by the Engine constructor `createEngine`
 */
export interface EngineProp {
   config: SnakeponyConfig
   random: prng
}

/**
 * Engine -- the external interface of the game engine
 */
export interface Engine {
   /**
    * add -- signal that the snake took length at the head, by doing a move
    */
   add: Observable<Move>
   /**
    * remove -- signal that the snake was shorten by one at the tail
    */
   remove: Observable<void>
   /**
    * score -- what the food is, "in real time"
    */
   score: NoisyState<Score>
   /**
    * food -- where the food is, "in real time"
    */
   food: NoisyState<Pair>
   /**
    * getTail -- obtain the position of the tail of the snake
    */
   getTail(): Pair
   /**
    * flushInit -- a hook that needs to be called once all instances are connected
    */
   flushInit(): void
   move: {
      [k in Direction]: () => any
   }
}

/**
 * Player -- the representation of the player on the board
 */
export interface Player {
   body: Pair[]
}

/**
 * Progression -- whether the player: is playing, has won or has lost
 */
export type Progression = 'playing' | 'victory' | 'defeat'

export type Score = number

/**
 * Topology -- the topological shape of the board
 * the way the board's opposite sides are linked together
 * See https://en.wikipedia.org/wiki/Surface_(topology)#Construction_from_polygons
 */
export interface Topology2D {
   leftRight: Topology1D
   topBottom: Topology1D
}

export type Topology1D = 'border' | 'loop' | 'crossed'

//
// Display
//
export type ScreenSize = NoisyState<Pair>

export type Move = Walk | Jump

/**
 * Walk -- move by a step in one direction
 */
export interface Walk {
   type: 'walk'
   direction: Direction
}

/**
 * Jump -- move to the specified destination
 */
export interface Jump {
   type: 'jump'
   direction: JumpDirection
   destination: Pair
}

// // //
// Support type
// // //

/**
 * Direction -- one of the four direction of a 2d board
 */
export type Direction = 'up' | 'down' | 'left' | 'right'

/**
 * JumpDirection -- a Direction that can also be "neutral" ("in-place")
 * This fulfils the requirement to be used as type for .direction in the
 * type "Jump"
 */
export type JumpDirection = Direction | 'in-place'

/**
 * Side -- one of the four sides of a square on a 2d board
 */
export type Side = 'top' | 'bottom' | 'left' | 'right'

/**
 * Side5 -- A side that can also be "the 5th side", the "neutral side"
 */
export type Side5 = Side | 'nowhere'

/**
 * Pair -- a pair of 2d coordinates or 2d values {x, y}
 */
export interface Pair<T = number> {
   x: T
   y: T
}

export interface WHPair<T = number> {
   width: T
   height: T
}

export interface HVPair<T = number> {
   horizontal: T
   vertical: T
}
