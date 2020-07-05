import { Pair, Topology1D } from './snakepony'

/**
 * Sizes are expressed in number of board squares
 */
export interface SnakeponyConfig {
   /**
    * size -- Size of the board (its value corrsponds to the board height)
    * Ignored if both sizeX and sizeY are provided
    */
   size: number
   /**
    * sizeX -- horizontal size of the board
    */
   sizeX: number
   /**
    * sizeY -- vertical size of the board
    */
   sizeY: number
   /**
    * seed -- the seed of the game
    */
   seed: string
   /**
    * topology -- the name of the topology of the board of the game
    */
   topology: string
   topologyLeftRight: Topology1D
   topologyTopBottom: Topology1D
   /**
    * feed -- specify a number of food to place right next to the snake's head
    */
   feed: number
   /** showMoveCount -- whether to show in game the number of move the player made */
   showMoveCount: boolean
}
