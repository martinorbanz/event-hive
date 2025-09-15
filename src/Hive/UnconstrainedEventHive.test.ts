import { describe, expect, it, test } from "vitest";
import { Event } from "../events";
import { UnconstrainedEventHive } from "./UnconstrainedEventHive";

class TestEvent extends Event<{ message: string }> {
  public static readonly type = 'test-event'
  constructor(type: string, data: { message: string }) {
    super(type, data);
  }
}

class FooEvent extends Event<{ message: string }> {
  public static readonly type = 'foo-event'
  constructor(type: string, data: { message: string }) {
    super(type, data);
  }
}

describe("UnconstrainedEventHive, default namespace", () => {
  it("should receive the dispatched event in default namespace", async () => {
    const hive = new UnconstrainedEventHive();
    const message = 'Jupiter, and beyond the infinite';

    const { unsubscribe } = hive.addListener<TestEvent>(
      TestEvent.type,
      (event) => {
        unsubscribe()
        expect(event.payload.message).toBe(message);
      },
      UnconstrainedEventHive.NS_DEFAULT
    );

    hive.dispatchEvent(new TestEvent(TestEvent.type, { message }));

  })
});

describe("UnconstrainedEventHive, dynamic namespace", () => {
  it("should receive the dispatched event in a dynamically created namespace", async () => {
    const hive = new UnconstrainedEventHive();
    const namespace = 'test-namespace';
    const message = 'Jupiter, and beyond the infinite';

    const { unsubscribe } = hive.addListener<TestEvent>(
      TestEvent.type,
      (event) => {
        unsubscribe();
        expect(hive.listNamespaceEvents(namespace)).toBe(undefined);
        expect(event.payload.message).toBe(message);
      },
    );

    hive.dispatchEvent(new TestEvent(TestEvent.type, { message }), namespace);
  })
});

describe("Stateful UnconstrainedEventHive", () => {
  test("should retain the last event for new subscribers", async () => {
    const statefulHive = new UnconstrainedEventHive({ stateful: true });
    const message = 'Jupiter, and beyond the infinite';

    statefulHive.dispatchEvent(new TestEvent(TestEvent.type, { message }));

    await Promise.resolve();

    const { unsubscribe } = statefulHive.addListener<TestEvent>(
      TestEvent.type,
      (event) => {
        expect(event.payload.message).toBe(message);
      }
    );

    await Promise.resolve();
    unsubscribe();
  })
});

describe("Stateful UnconstrainedEventHive", () => {
  test("should trim first an Event Emitter and then a namespace", async () => {
    const hive = new UnconstrainedEventHive();
    const fooNamespace = 'foo-namespace';

    const { unsubscribe: removeTestListener } = hive.addListener<TestEvent>(
      TestEvent.type,
      () => { },
      fooNamespace
    );

    const { unsubscribe: removeFooListener } = hive.addListener<FooEvent>(
      FooEvent.type,
      () => { },
      fooNamespace
    );

    expect(hive.listNamespaceEvents(fooNamespace)).toEqual([TestEvent.type, FooEvent.type]);

    removeTestListener();

    expect(hive.listNamespaceEvents(fooNamespace)).toEqual([FooEvent.type]);

    removeFooListener();

    expect(hive.listNamespaceEvents(fooNamespace)).toBe(undefined);
  })
});