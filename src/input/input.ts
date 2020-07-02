import { Observable, Subject } from 'rxjs'
import { PonyInput } from '../type/snakepony'
import { createKeyboardManager } from './keyboardManager'
import { createFingerMoveManager } from './fingerMoveManager'

export let createInput = (): PonyInput => {
   let keyboard = createKeyboardManager({
      element: document.documentElement,
      evPropName: 'key',
   })

   let fingerMoveManager = createFingerMoveManager({
      element: document.documentElement,
   })

   let makeObservable = (key: string, swipe: Subject) => {
      return new Observable<void>((subscriber) => {
         let callback = () => subscriber.next()
         let subS = swipe.subscribe(callback)
         let subK = keyboard.onKeydown(key, callback)
         return () => {
            subK.remove()
            subS.remove(subS)
         }
      })
   }

   return {
      left: makeObservable('ArrowLeft', fingerMoveManager.left),
      right: makeObservable('ArrowRight', fingerMoveManager.right),
      up: makeObservable('ArrowUp', fingerMoveManager.up),
      down: makeObservable('ArrowDown', fingerMoveManager.down),
      removeAll: () => {
         keyboard.removeAll()
         fingerMoveManager.removeAll()
      },
   }
}
