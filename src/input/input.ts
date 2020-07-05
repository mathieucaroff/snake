import { Observable, Subject } from 'rxjs'
import { PonyInput, Directive } from '../type/snakepony'
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

   let fmmDirective = fingerMoveManager.directive

   let directive: Directive<Observable<void>> = {
      left: makeObservable('ArrowLeft', fmmDirective.left),
      right: makeObservable('ArrowRight', fmmDirective.right),
      up: makeObservable('ArrowUp', fmmDirective.up),
      down: makeObservable('ArrowDown', fmmDirective.down),
   }

   return {
      directive,
      removeAll: () => {
         keyboard.removeAll()
         fingerMoveManager.removeAll()
      },
   }
}
