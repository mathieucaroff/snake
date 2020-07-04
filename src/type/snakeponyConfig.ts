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
    * gridSize -- a convenience type which gather sizeX and sizeY
    */
   gridSize: Pair
   /**
    * seed -- the seed of the game
    */
   seed: string
   /**
    * topology -- the topology of the board of the game
    */
   topologyLeftRight: Topology1D
   topologyTopBottom: Topology1D
}
