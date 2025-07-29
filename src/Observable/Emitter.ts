import { IEvent } from "../Events";

export interface EventSubscription {
  unsubscribe: () => void;
}

export type EventCallback<T extends IEvent<unknown>> = (event: T) => unknown;

export interface ISubject<T extends IEvent<unknown>> {
  subscribe(value: EventCallback<IEvent<unknown>>): EventSubscription;
  next(event?: T): void;
}

export type EmitterOptions = {
  stateful?: boolean;
};

export class Emitter<T extends IEvent<unknown>> implements ISubject<T> {
  subscribers: EventCallback<T>[] = [];

  isStateful: boolean;
  private currentValue: T | undefined;

  constructor({ stateful }: EmitterOptions = {}) {
    this.isStateful = stateful ?? false;
  }

  removeSubscriber(callback: EventCallback<T>): void {
    this.subscribers = this.subscribers.filter(
      (storedSubscriber) => storedSubscriber !== callback
    );
  }

  subscribe(callback: EventCallback<T>): EventSubscription {
    this.removeSubscriber(callback);
    this.subscribers = [...this.subscribers, callback];
    const newSubscription: EventSubscription = {
      unsubscribe: () => {
        this.removeSubscriber(callback);
      },
    };
    if (this.isStateful && this.currentValue) callback(this.currentValue);
    return newSubscription;
  }

  next(event: T): void {
    if (this.isStateful) this.currentValue = event;
    this.subscribers.forEach((callback: EventCallback<T>) => {
      callback(event);
    });
  }
}
