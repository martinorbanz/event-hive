import { IEvent } from "../events";

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

export class Emitter<T extends IEvent<unknown>> {
  private subscribers = new Set<EventCallback<T>>();
  private currentValue?: T;
  private isStateful: boolean;

  constructor({ stateful = false }: EmitterOptions = {}) {
    this.isStateful = stateful;
  }

  subscribe(callback: EventCallback<T>): EventSubscription {
    this.subscribers.add(callback);
    if (this.isStateful && this.currentValue) {
      callback(this.currentValue);
    }
    return {
      unsubscribe: () => {
        this.subscribers.delete(callback);
      },
    };
  }

  next(event: T): void {
    if (this.isStateful) this.currentValue = event;
    for (const callback of this.subscribers) {
      Promise.resolve().then(() => callback(event));
    }
  }

  getSubscriberCount(): number {
    return this.subscribers.size;
  }

  clear(): void {
    this.subscribers.clear();
  }

  removeSubscriber(subscriber: EventCallback<T>): void {
    this.subscribers.delete(subscriber);
  }
};
