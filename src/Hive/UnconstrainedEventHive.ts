import { Emitter, EventSubscription, EventCallback } from '../Observable/Emitter'
import { Event } from '../Events'

interface IEventHive {
  addListener: <T extends string, P>(type: string, handler: EventCallback<Event<T, P>>) => EventSubscription
  removeListener: <T extends string, P>(type: string, handler: EventCallback<Event<T, P>>) => void
  dispatchEvent: <T extends string, P>(event: Event<T, P>) => void
  createEvent: <T extends string, P>(type: T, payload: P) => Event<T, P>
}


// export type StringEnum<E> = Record<keyof E, string>

export type EventNamespaceConstraint = Record<string, Array<string>>

export class EventHive<E> implements IEventHive {
  static NS_DEFAULT = 'default'

  #registry = {}
  #constraint: EventNamespaceConstraint

  constructor(constraint?: EventNamespaceConstraint) {
    this.#registry[EventHive.NS_DEFAULT] = {}
    if (constraint) {
      this.#constraint = constraint
    }
  }

  registerEvent<T extends string, P>(type: string, namespace: string = EventHive.NS_DEFAULT) {
    if (
      this.#constraint &&
      !this.#constraint[namespace] ||
      !Object.values(this.#constraint[namespace]).includes(type)
    ) {
      throw new Error('Attempted to register an Event that does not match the constraint.')
    }

    if (!this.#registry[namespace]) {
      this.#registry[namespace] = {}
    }
    if (!this.#registry[namespace][type]) {
      this.#registry[namespace][type] = new Emitter<Event<T, P>>()
    }
  }

  addListener<T extends string, P>(type: string, handler: EventCallback<Event<T, P>>, namespace: string = EventHive.NS_DEFAULT): EventSubscription {
    this.registerEvent(type, namespace)
    return this.#registry[namespace][type].subscribe(handler)
  }

  removeEmptyEvent(type: string, namespace: string) {
    if (
      this.#registry[namespace]
      && this.#registry[namespace][type]
      && this.#registry[namespace][type].subscribers.length === 0) {
      delete this.#registry[namespace][type]
    }
  }

  removeEmptyNamespace(namespace: string) {
    if (
      this.#registry[namespace]
      && Object.keys(this.#registry[namespace]).length === 0
    ) (
      delete this.#registry[namespace]
    )
  }

  removeListener<T extends string, P>(type: string, handler: EventCallback<Event<T, P>>, namespace: string = EventHive.NS_DEFAULT) {
    if (this.#registry[namespace] && this.#registry[namespace][type]) {
      this.#registry[namespace][type].removeSubscriber(handler)
    }
    this.removeEmptyEvent(type, namespace)
    this.removeEmptyNamespace(namespace)
  }

  dispatchEvent<T extends string, P>(event: Event<T, P>, namespace: string = EventHive.NS_DEFAULT) {
    this.registerEvent(event.type, namespace)
    this.#registry[namespace][event.type].next(event)
  }

  private deleteNamespace(namespace: string) {
    delete this.#registry[namespace];
  }

  deleteAllNamespaces() {
    Object.keys(this.#registry).forEach((namespace) => {
      this.deleteNamespace(namespace);
    })
  }

  createEvent<T extends string, P>(type: T, payload?: P) { return new Event(type, payload) }

}
