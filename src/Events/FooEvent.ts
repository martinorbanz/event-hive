import { Event } from "./Event"

export interface FooEventPayload {
  value: string
}

export class FooEvent extends Event<string, FooEventPayload> {

  public static type = 'foo'

  constructor(payload: FooEventPayload) {
    super(FooEvent.type, payload)
  }
}
