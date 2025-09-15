import { IEvent } from "../events";
import { EmitterOptions } from "../observable";
import { UnconstrainedEventHive } from "./UnconstrainedEventHive";

export type EventNamespace = Array<IEvent<unknown>["type"]>;

export type EventNamespaceConstraint = Record<
  "default" | string,
  EventNamespace
>;

function findConstraintMatches(
  name: string,
  constraint: EventNamespaceConstraint
) {
  const matches = Object.keys(constraint)
    .map((namespace) => {
      return constraint[namespace].includes(name) ? namespace : undefined;
    })
    .filter(Boolean);
  return matches;
}

export class EventHive<C extends EventNamespaceConstraint> extends UnconstrainedEventHive {
  public static readonly ERROR_CONSTRAINT_VIOLATION =
    "Attempted to register an Event that does not match the constraint.";
  constraint: C;

  constructor(constraint: C, options?: EmitterOptions) {
    super(options);
    this.constraint = constraint;
    Object.freeze(this.constraint);
  }

  registerEvent = (type: string, namespace: string = EventHive.NS_DEFAULT) => {
    const matches = findConstraintMatches(type, this.constraint);

    if (!matches.includes(namespace)) {
      throw new Error(
        `${EventHive.ERROR_CONSTRAINT_VIOLATION} Event ${String(type)} in namespace ${String(namespace)}.` 
      );
    }

    super.registerEvent(type, namespace);
  };
}
