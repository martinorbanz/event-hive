export interface IEventPayload<P> {
  value: P
};

export interface IEvent<TPayload = undefined> {
  type: string;
  payload?: TPayload;
}

export class Event<TPayload = undefined> implements IEvent<TPayload>{

  type: string;
  payload: TPayload | undefined;

  constructor(type: IEvent['type'], payload?: IEvent['payload']) {
    this.type = type
    this.payload = payload
  }
}