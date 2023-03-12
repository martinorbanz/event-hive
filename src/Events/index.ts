export interface IEvent<T> {
  type: string
  payload: T
}

export class Event<T> implements IEvent<T>{

  type: string
  payload: T

  constructor(type: string, payload: T = null) {
    this.type = type
    this.payload = payload
  }
}