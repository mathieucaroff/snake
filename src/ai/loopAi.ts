import { Directive } from '../type/snakepony'

export function createLoopAi(config, fastMove: Directive<() => any>) {
   if (config.sizeY % 2 > 0) {
      throw new Error('the height of the board must be a multiple of 2')
   }

   let move: Directive<() => Promise<any>> = Object.fromEntries(
      Object.entries(fastMove).map(([name, moveFunction]) => {
         return [
            name,
            async () => {
               await new Promise((resolve) => setTimeout(resolve, 100))
               moveFunction()
            },
         ]
      }),
   ) as any

   let init = async () => {
      await move.up()
      await move.left()
      await move.left()
      await move.left()
      await move.up()
   }
   let rightWidth = async () => {
      for (let k = 0; k < config.sizeX - 2; k++) {
         await move.right()
      }
   }
   let leftWidth = async () => {
      for (let k = 0; k < config.sizeX - 2; k++) {
         await move.left()
      }
   }
   let downZigZag = async () => {
      for (let k = 0; k < config.sizeY / 2; k++) {
         if (k > 0) {
            await move.down()
         }
         await rightWidth()
         await move.down()
         await leftWidth()
      }
   }
   let upHeight = async () => {
      for (let k = 0; k < config.sizeY; k++) {
         await move.up()
      }
   }
   let run = async () => {
      await init()
      while (true) {
         await move.right()
         await downZigZag()
         await move.left()
         await upHeight()
      }
   }

   run()
}
