export interface EventSubscription {
  unsubscribe: () => void
}

export type EventCallback<T> = (event: T) => unknown

export interface ISubject<T> {
  subscribe(value: EventCallback<T>): EventSubscription
  next(event?: T): void
}

export class Emitter<T> implements ISubject<T> {
  subscribers: EventCallback<T>[] = []

  currentValue: T | undefined

  removeSubscriber(
    callback: EventCallback<T>
  ): void {
    this.subscribers = this.subscribers.filter(
      (storedSubscriber) => storedSubscriber !== callback
    )
  }

  subscribe(callback: EventCallback<T>): EventSubscription {
    this.removeSubscriber(callback)
    this.subscribers = [...this.subscribers, callback]
    const newSubscription: EventSubscription = {
      unsubscribe: () => {
        this.removeSubscriber(callback)
      }
    }
    if (this.currentValue) callback(this.currentValue)
    return newSubscription
  }

  next(event: T): void {
    this.currentValue = event
    this.subscribers.forEach((callback: EventCallback<T>) => {
      callback(event)
    })
  }
}