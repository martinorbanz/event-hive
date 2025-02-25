import { Event } from "./Event"

export interface BarEventPayload {
  value: string
}

export class BarEvent extends Event<string, BarEventPayload> {

  public static type = 'bar'

  constructor(payload: BarEventPayload) {
    super(BarEvent.type, payload)
  }
}
