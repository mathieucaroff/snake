import { Subject } from 'rxjs'

export let createFingerMoveManager = ({ element }) => {
   let getTouches = (event: any): MouseEvent => {
      return (
         // browser API ?? jQuery
         event.touches?.[0] ?? event.originalEvent?.touches?.[0] ?? event
      )
   }

   let xDown = 0
   let yDown = 0

   let handleTouchStart = (evt) => {
      let touches = getTouches(evt)

      xDown = touches.clientX
      yDown = touches.clientY
   }

   let handleTouchMove = (evt) => {
      if (!xDown || !yDown) {
         return
      }

      let touches = getTouches(evt)

      let currentX = touches.clientX
      let currentY = touches.clientY

      let dx = xDown - currentX
      let dy = yDown - currentY

      let dist = dx ** 2 + dy ** 2

      if (dist < 80 ** 2) {
         return
      }

      if (Math.abs(dx) > Math.abs(dy)) {
         /*most significant*/
         if (dx > 0) {
            directive.left.next()
         } else {
            directive.right.next()
         }
      } else {
         if (dy > 0) {
            directive.up.next()
         } else {
            directive.down.next()
         }
      }

      xDown = currentX
      yDown = currentY
   }

   let mouseIsDown = false
   let handleMouseDown = (ev: Event) => {
      mouseIsDown = true
      handleTouchStart(ev)
   }

   let handleMouseMove = (ev) => {
      if (mouseIsDown) {
         handleTouchMove(ev)
      }
   }

   let handleMouseUp = () => {
      mouseIsDown = false
   }

   element.addEventListener('touchstart', handleTouchStart, false)
   element.addEventListener('touchmove', handleTouchMove, false)
   element.addEventListener('mousedown', handleMouseDown, false)
   element.addEventListener('mousemove', handleMouseMove, false)
   element.addEventListener('mouseup', handleMouseUp, false)

   let removeAll = () => {
      element.removeEventListener('touchstart', handleTouchStart, false)
      element.removeEventListener('touchmove', handleTouchMove, false)
      element.removeEventListener('mousedown', handleMouseDown, false)
      element.removeEventListener('mousemove', handleMouseMove, false)
      element.removeEventListener('mouseup', handleMouseUp, false)
   }

   let directive = {
      left: new Subject<void>(),
      right: new Subject<void>(),
      up: new Subject<void>(),
      down: new Subject<void>(),
   }

   let me = {
      directive,
      removeAll,
   }

   return me
}
