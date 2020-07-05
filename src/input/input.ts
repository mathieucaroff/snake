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

   let makeObservable = (keyList: string[], swipe: Subject) => {
      return new Observable<void>((subscriber) => {
         let callback = () => subscriber.next()
         let subS = swipe.subscribe(callback)
         let subKList = keyList.map((key) => {
            return keyboard.onKeydown(key, callback)
         })
         return () => {
            subKList.forEach((subK) => {
               subK.remove()
            })
            subS.remove(subS)
         }
      })
   }

   let fmmDirective = fingerMoveManager.directive

   let directive: Directive<Observable<void>> = {
      up: makeObservable(['ArrowUp', 'e'], fmmDirective.up),
      left: makeObservable(['ArrowLeft', 's'], fmmDirective.left),
      down: makeObservable(['ArrowDown', 'd'], fmmDirective.down),
      right: makeObservable(['ArrowRight', 'f'], fmmDirective.right),
   }

   return {
      directive,
      removeAll: () => {
         keyboard.removeAll()
         fingerMoveManager.removeAll()
      },
   }
}
