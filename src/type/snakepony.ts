import { Observable } from 'rxjs'
import { NoisyState } from '../util/noisyState'
import { Dir } from 'fs'

//
// Module types
//

// Input
export interface PonyInput {
   left: Observable<void>
   right: Observable<void>
   up: Observable<void>
   down: Observable<void>
   removeAll: () => void
}

// State, game engine
export interface Engine {
   add: Observable<Move>
   remove: Observable<void>
   score: NoisyState<Score>
   food: NoisyState<Pair>
   getTail(): Pair
   flushInit(): void
}

export interface Player {
   body: Pair[]
}

export type Progression = 'playing' | 'victory' | 'defeat'

export type Score = number

// Display
export type Move = Walk | Jump

export interface Walk {
   type: 'walk'
   direction: Direction
}

export interface Jump {
   type: 'jump'
   direction: JumpDirection
   destination: Pair
}

//
// Support type
//

export type Direction = 'up' | 'down' | 'left' | 'right'

export type JumpDirection = Direction | 'in-place'

export type Side = 'top' | 'bottom' | 'left' | 'right'

export type Side5 = Side | 'nowhere'

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
