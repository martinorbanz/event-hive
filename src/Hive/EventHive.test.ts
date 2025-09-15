import { describe, it, expect } from "vitest";
import { EventHive } from "./EventHive";
import { Event } from "../events";

describe("EventHive", () => {
  const constraint = {
    default: ["foo"],
    bar: ["bar"],
  };

  it("should allow registering events that match the constraint", () => {
    const hive = new EventHive(constraint);

    expect(() => hive.registerEvent("foo")).not.toThrow();
    expect(() => hive.registerEvent("bar", "bar")).not.toThrow();
  });

  it("should throw an error when registering events that do not match the constraint", () => {
    const hive = new EventHive(constraint);

    expect(() => hive.registerEvent("bar")).toThrowError(
      `${EventHive.ERROR_CONSTRAINT_VIOLATION} Event bar in namespace default.`
    )
    expect(() => hive.registerEvent("foo", "bar")).toThrowError(
      `${EventHive.ERROR_CONSTRAINT_VIOLATION} Event foo in namespace bar.`
    );
  });
});
