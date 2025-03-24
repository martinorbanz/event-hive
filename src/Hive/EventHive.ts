import {
  Emitter,
  EventSubscription,
  EventCallback,
} from "../Observable/Emitter";
import { IEvent, IEventPayload } from "../Events";

export type EventNamespaceConstraint = Record<string, Array<string>>

interface IEventHive {
  addListener: <T, P extends IEventPayload<T>>(
    type: string,
    handler: EventCallback<IEvent<P>>
  ) => EventSubscription;
  removeListener: <T, P extends IEventPayload<T>>(
    type: string,
    handler: EventCallback<IEvent<P>>
  ) => void;
  dispatchEvent: <P = undefined>(event: IEvent<P>) => void;
}

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

  #registry: Record<string, Record<string, Emitter<IEvent<unknown>>>> = {};
  #constraint: C;

  constructor(constraint: C) {
    this.#registry[EventHive.NS_DEFAULT] = {};
    this.#constraint = constraint;
  }

  registerEvent<P = undefined>(
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
          this.#registry[namespace][type] = new Emitter<IEvent<P>>();
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
    handler: EventCallback<IEvent<P>>,
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

  removeListener<P>(
    type: string,
    handler: EventCallback<IEvent<P>>,
    namespace: string = EventHive.NS_DEFAULT
  ) {
    if (this.#registry[namespace] && this.#registry[namespace][type]) {
      this.#registry[namespace][type].removeSubscriber(handler);
    }
    this.removeEmptyEvent(type, namespace);
    this.removeEmptyNamespace(namespace);
  }

  dispatchEvent<P = undefined>(
    event: IEvent<P>,
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
}
