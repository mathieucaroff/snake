export let getContext2d = (canvas: HTMLCanvasElement) => {
   let ctx = canvas.getContext('2d')
   if (ctx === null) {
      throw new Error()
   }
   return ctx
}
