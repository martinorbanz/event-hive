import { Event } from 'event-hive';

export interface FooEventPayload {
  value: string
}

export class FooEvent extends Event<string, FooEventPayload> {

  public static type = 'foo';

  public override payload: FooEventPayload;

  constructor(payload: FooEventPayload) {
    super(FooEvent.type);
    this.payload = payload;
  }
}
