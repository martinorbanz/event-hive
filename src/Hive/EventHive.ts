import { IEvent } from "../Events";
import {
  Emitter,
  EventCallback,
  EventSubscription,
} from "../Observable/Emitter";

export type EventNamespace = Array<IEvent<unknown>["type"]>;

export type EventNamespaceConstraint = Record<
  "default" | string,
  EventNamespace
>;

interface IEventHive {
  addListener: (
    type: string,
    handler: EventCallback<IEvent<unknown>>
  ) => EventSubscription;
  removeListener: (
    type: string,
    handler: EventCallback<IEvent<unknown>>,
    namespace?: string
  ) => void;
  dispatchEvent: <P = undefined>(event: IEvent<P>) => void;
}

function findConstraintMatches(
  name: string,
  constraint: EventNamespaceConstraint
) {
  const matches = Object.keys(constraint)
    .map((namespace) => {
      return constraint[namespace].includes(name) ? namespace : undefined;
    })
    .filter(Boolean);
  return matches;
}

export class EventHive<C extends EventNamespaceConstraint>
  implements IEventHive
{
  static NS_DEFAULT = "default";

  registry: Record<string, Record<string, Emitter<IEvent<unknown>>>> = {
    default: {},
  };
  constraint: C;

  constructor(constraint: C) {
    this.registry[EventHive.NS_DEFAULT] = {};
    this.constraint = constraint;
  }

  registerEvent = (type: string, namespace: string = EventHive.NS_DEFAULT) => {
    const matches = findConstraintMatches(type, this.constraint);

    if (!matches.includes(namespace)) {
      throw new Error(
        "Attempted to register an Event that does not match the constraint."
      );
    }

    if (!this.registry[namespace]) {
      this.registry[namespace] = {};
    }
    if (!this.registry[namespace][type]) {
      this.registry[namespace][type] = new Emitter<IEvent<unknown>>();
    }
  };

  addListener = (
    type: string,
    handler: EventCallback<IEvent<unknown>>,
    namespace: string = EventHive.NS_DEFAULT
  ): EventSubscription => {
    this.registerEvent(type, namespace);
    return this.registry[namespace][type].subscribe(handler);
  };

  removeEmptyEvent = (type: string, namespace: string) => {
    if (
      this.registry[namespace] &&
      this.registry[namespace][type] &&
      this.registry[namespace][type].subscribers.length === 0
    ) {
      delete this.registry[namespace][type];
    }
  };

  removeEmptyNamespace = (namespace: string) => {
    if (
      this.registry[namespace] &&
      Object.keys(this.registry[namespace]).length === 0
    )
      delete this.registry[namespace];
  };

  removeListener = (
    type: string,
    handler: EventCallback<IEvent<unknown>>,
    namespace: string = EventHive.NS_DEFAULT
  ) => {
    if (this.registry[namespace] && this.registry[namespace][type]) {
      this.registry[namespace][type].removeSubscriber(handler);
    }
    this.removeEmptyEvent(type, namespace);
    this.removeEmptyNamespace(namespace);
  };

  dispatchEvent = (
    event: IEvent<unknown>,
    namespace: string = EventHive.NS_DEFAULT
  ) => {
    this.registerEvent(event.type, namespace);
    this.registry[namespace][event.type].next(event);
  };

  private deleteNamespace = (namespace: string) => {
    delete this.registry[namespace];
  };

  deleteAllNamespaces = () => {
    Object.keys(this.registry).forEach((namespace) => {
      this.deleteNamespace(namespace);
    });
  };
}
