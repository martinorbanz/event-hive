export interface IEvent<T extends string, P = undefined> {
  type: T
  payload: P
}

export class Event<T extends string, P = undefined> implements IEvent<T, P>{

  type: T
  payload: P

  constructor(type: T, payload?: P) {
    this.type = type
    this.payload = payload
  }
}