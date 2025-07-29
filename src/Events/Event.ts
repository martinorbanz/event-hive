export interface IEvent<P  = undefined> {
  type: string;
  payload?: P;
}

export class Event<P = undefined> implements IEvent<P>{

  type: string;
  payload: P | undefined;

  constructor(type: string, payload?: P) {
    this.type = type
    this.payload = payload
  }
}