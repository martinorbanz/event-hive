export interface IEventPayload<P> {
  value: P
};

export interface IEvent<T = undefined> {
  type: string;
  payload?: IEventPayload<T>;
}

export class Event<P = undefined> implements IEvent<P>{

  type: string;
  payload: IEventPayload<P> | undefined;

  constructor(type: T, payload?: IEventPayload<P>) {
    this.type = type
    this.payload = payload
  }
}