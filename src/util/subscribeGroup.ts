import { Observable } from 'rxjs'
import { entries } from './entries'

export let subscribeGroup = <
   T extends Record<string, Observable<any>>,
   U extends Record<keyof T, () => void>
>(
   observableGroup: T,
   consumerGroup: U,
): void => {
   entries(observableGroup).forEach(([name, observable]) => {
      let consumer = consumerGroup[name]

      observable.subscribe(consumer)
   })
}
