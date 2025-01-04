import {
  Emitter,
  EventSubscription,
  EventCallback,
} from "../Observable/Emitter";
import { Event, IEvent } from "../Events";

export type EventNamespaceConstraint = Record<string, Array<string>>

export type ConstrainedEventNames<T extends EventNamespaceConstraint> = T[keyof T][number];


interface IEventHive {
  addListener: <T extends EventNamespaceConstraint, P = undefined>(
    type: ConstrainedEventNames<T>,
    handler: EventCallback<IEvent<ConstrainedEventNames<T>, P>>
  ) => EventSubscription;
  removeListener: <T extends EventNamespaceConstraint, P = undefined>(
    type: string,
    handler: EventCallback<IEvent<ConstrainedEventNames<T>, P>>
  ) => void;
  dispatchEvent: <T extends EventNamespaceConstraint, P = undefined>(event: IEvent<ConstrainedEventNames<T>, P>) => void;
  createEvent: <T extends EventNamespaceConstraint, P = undefined>(type: ConstrainedEventNames<T> , payload: P) => IEvent<ConstrainedEventNames<T>, P>;
}

// export type StringEnum<E> = Record<keyof E, string>

function findConstraintMatches(
  name: string,
  constraint: EventNamespaceConstraint
) {
  return Object.keys(constraint)
    .map((namespace) => {
      if (constraint[namespace].includes(name)) {
        return name;
      }
    })
    .filter(Boolean);
}

export class EventHive<C extends EventNamespaceConstraint>
  implements IEventHive
{
  static NS_DEFAULT = "default";

  #registry = {};
  #constraint: C;

  constructor(constraint: C) {
    this.#registry[EventHive.NS_DEFAULT] = {};
    this.#constraint = constraint;
  }

  registerEvent<T extends string, P>(
    type: string,
    namespace: string = EventHive.NS_DEFAULT
  ) {
    const matches = findConstraintMatches(type, this.#constraint);

    switch (matches.length) {
      case 0:
        throw new Error(
          "Attempted to register an Event that does not match the constraint."
        );

      case 1:
        if (!this.#registry[namespace]) {
          this.#registry[namespace] = {};
        }
        if (!this.#registry[namespace][type]) {
          this.#registry[namespace][type] = new Emitter<Event<T, P>>();
        }
        break;

      default:
        throw new Error(
          "Attempted to register an Event type that exists in multiple namespaces. Please provide a namespace parameter"
        );
    }
  }

  addListener<P>(
    type: string,
    handler: EventCallback<IEvent<string, P>>,
    namespace: string = EventHive.NS_DEFAULT
  ): EventSubscription {
    this.registerEvent(type, namespace);
    return this.#registry[namespace][type].subscribe(handler);
  }

  removeEmptyEvent(type: string, namespace: string) {
    if (
      this.#registry[namespace] &&
      this.#registry[namespace][type] &&
      this.#registry[namespace][type].subscribers.length === 0
    ) {
      delete this.#registry[namespace][type];
    }
  }

  removeEmptyNamespace(namespace: string) {
    if (
      this.#registry[namespace] &&
      Object.keys(this.#registry[namespace]).length === 0
    )
      delete this.#registry[namespace];
  }

  removeListener<T extends string, P>(
    type: string,
    handler: EventCallback<IEvent<T, P>>,
    namespace: string = EventHive.NS_DEFAULT
  ) {
    if (this.#registry[namespace] && this.#registry[namespace][type]) {
      this.#registry[namespace][type].removeSubscriber(handler);
    }
    this.removeEmptyEvent(type, namespace);
    this.removeEmptyNamespace(namespace);
  }

  dispatchEvent<T extends string, P = undefined>(
    event: IEvent<T, P>,
    namespace: string = EventHive.NS_DEFAULT
  ) {
    this.registerEvent(event.type, namespace);
    this.#registry[namespace][event.type].next(event);
  }

  private deleteNamespace(namespace: string) {
    delete this.#registry[namespace];
  }

  deleteAllNamespaces() {
    Object.keys(this.#registry).forEach((namespace) => {
      this.deleteNamespace(namespace);
    });
  }

  createEvent<T extends EventNamespaceConstraint, P>(type: ConstrainedEventNames<T>, payload?: P) {
    return new Event(type, payload);
  }
}
