import { IEvent } from "../events";
import {
  Emitter,
  EmitterOptions,
  EventCallback,
  EventSubscription,
} from "../observable";

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

export class UnconstrainedEventHive implements IEventHive {
  static NS_DEFAULT = "default";

  private registry: Record<string, Record<string, Emitter<IEvent<unknown>>>> = {
    default: {},
  };

  private _isStateful: boolean = false;

  get isStateful() { return this._isStateful; }

  constructor(options: EmitterOptions = {}) {
    this.registry[UnconstrainedEventHive.NS_DEFAULT] = {};
    this._isStateful = options.stateful ?? false;
  }

  registerEvent(type: string, namespace: string = UnconstrainedEventHive.NS_DEFAULT) {
    if (!this.registry[namespace]) {
      this.registry[namespace] = {};
    }
    if (!this.registry[namespace][type]) {
      this.registry[namespace][type] = new Emitter<IEvent<unknown>>({ stateful: this._isStateful });
    }
  };

  addListener = <T extends IEvent<unknown>>(
    type: string,
    handler: EventCallback<T>,
    namespace: string = UnconstrainedEventHive.NS_DEFAULT
  ): EventSubscription => {
    this.registerEvent(type, namespace);
    this.registry[namespace][type].subscribe(handler as EventCallback<IEvent<unknown>>);
    return { unsubscribe: () => this.removeListener(type, handler, namespace) };
  };

  removeListener = (
    type: string,
    handler: EventCallback<IEvent<unknown>>,
    namespace: string = UnconstrainedEventHive.NS_DEFAULT
  ) => {
    if (this.registry[namespace] && this.registry[namespace][type]) {
      this.registry[namespace][type].removeSubscriber(handler);
    }
    this.removeEmptyEvent(type, namespace);
    this.removeEmptyNamespace(namespace);
  };

  dispatchEvent = <T extends IEvent<unknown>>(
    event: T,
    namespace: string = UnconstrainedEventHive.NS_DEFAULT
  ) => {
    this.registerEvent(event.type, namespace);
    this.registry[namespace][event.type].next(event);
  };

  removeEmptyEvent = (type: string, namespace: string) => {
    if (
      this.registry[namespace] &&
      this.registry[namespace][type] &&
      this.registry[namespace][type].getSubscriberCount() === 0
    ) {
      delete this.registry[namespace][type];
    }
  };

  private deleteNamespace = (namespace: string) => {
    delete this.registry[namespace];
  };

  removeEmptyNamespace = (namespace: string) => {
    if (
      this.registry[namespace] &&
      Object.keys(this.registry[namespace]).length === 0
    )
      delete this.registry[namespace];
  };

  deleteAllNamespaces = () => {
    Object.keys(this.registry).forEach((namespace) => {
      this.deleteNamespace(namespace);
    });
  };
}
