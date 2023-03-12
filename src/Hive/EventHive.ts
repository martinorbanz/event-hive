import { Emitter, EventSubscription, EventCallback } from '../Observable/Emitter'
import { Event } from '../Events'

interface IEventHive {
  addListener: <T>(type: string, handler: EventCallback<Event<T>>) => EventSubscription
  removeListener: <T>(type: string, handler: EventCallback<Event<T>>) => void
  dispatchEvent: <T>(event: Event<T>) => void
}

export const NS_DEFAULT = 'default'

const registry = {}
registry[NS_DEFAULT] = {}

export class EventHive implements IEventHive {

  registerEvent<T>(type: string, namespace: string = NS_DEFAULT) {
    if (!registry[namespace]) registry[namespace] = {}
    if (!registry[namespace][type]) {
      registry[namespace][type] = new Emitter<Event<T>>()
    }
  }

  addListener<T>(type: string, handler: EventCallback<Event<T>>, namespace: string = NS_DEFAULT): EventSubscription {
    this.registerEvent(type, namespace)
    return registry[namespace][type].subscribe(handler)
  }

  removeEmptyEvent(type: string, namespace: string) {
    if (
      registry[namespace]
      && registry[namespace][type]
      && registry[namespace][type].subscribers.length === 0) {
      delete registry[namespace][type]
    }
  }

  removeEmptyNamespace(namespace: string) {
    if (
      registry[namespace]
      && Object.keys(registry[namespace]).length === 0
    ) (
      delete registry[namespace]
    )
  }

  removeListener<T>(type: string, handler: EventCallback<Event<T>>, namespace: string = NS_DEFAULT) {
    if (registry[namespace] && registry[namespace][type]) {
      registry[namespace][type].removeSubscriber(handler)
    }
    this.removeEmptyEvent(type, namespace)
    this.removeEmptyNamespace(namespace)
  }

  dispatchEvent<T>(event: Event<T>, namespace: string = NS_DEFAULT) {
    this.registerEvent(event.type, namespace)
    registry[namespace][event.type].next(event)
  }

  public static readonly singleton = new EventHive()

}
