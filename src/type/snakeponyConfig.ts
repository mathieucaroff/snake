import { Pair, HVPair } from './snakepony'

export interface SnakeponyConfig {
   size: number
   sizeX: number
   sizeY: number
   gridSize: Pair
   seed: string
   // topology: HVPair<Topology>
}

// export type Topology = 'border' | 'loop' | 'crossed'
