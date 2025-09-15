# 🐝 EventHive

*This document was created using chatbot support. It still needs editing.*

**EventHive** is a lightweight, type-safe event system for TypeScript applications. It offers dynamic event registration, scoped namespaces, and lifecycle-safe React integration—without the overhead of a full state management library.


---

## 🚀 Getting Started

EventHive is framework-agnostic and ready to plug into any TypeScript project.

### 📦 Installation

```bash
npm install event-hive
# or
yarn add event-hive
```

### 🐝 First Event

```ts
import { UnconstrainedEventHive, Event } from "event-hive";

const hive = new UnconstrainedEventHive();

hive.addListener("ping", (event) => {
  console.log("Received:", event.payload);
});

hive.dispatchEvent(new Event("ping", { message: "Hello Hive!" }));
```

### Next Steps

- Learn the [Core Concepts](#:brain:-core-concepts)
- Organize your system with [Namespaces](#jigsaw-namespaces)
- Choose the right layer in [Strategic Usage](#strategic-usage)
- Add strong typing with [Type Safety](#type-safety)
- Integrate cleanly with [React](#react-integration)

---

## 🧠 Core Concepts

EventHive is built around a few simple but powerful ideas that make event handling scalable, intuitive, and lifecycle-safe.

### `Event`

A lightweight object with a `type` and optional `payload`.

```ts
const loginEvent = new Event("login", { userId: "abc123" });
```

### Automatic Registration & Cleanup

Events are automatically registered when you dispatch or listen to them. When the last listener is removed, the event is unregistered. Empty namespaces are also removed—keeping the hive lean.

### `UnconstrainedEventHive`

A flexible hive that allows any event type in any namespace.

```ts
import { UnconstrainedEventHive, Event } from "event-hive";

const hive = new UnconstrainedEventHive();

hive.addListener("submit", (event) => {
  console.log("Form submitted:", event.payload);
}, "form");

hive.dispatchEvent(new Event("submit", { data: "..." }), "form");
```

### `EventHive`

A constrained hive that enforces which event types are allowed in which namespaces via `EventNamespaceConstraint`.

```ts
import { EventHive, EventNamespaceConstraint, Event } from "event-hive";

const constraint: EventNamespaceConstraint = {
  default: ["login", "logout"],
  form: ["submit", "reset"],
};

const hive = new EventHive(constraint);

hive.addListener("submit", handler, "form"); // ✅ allowed
hive.dispatchEvent(new Event("submit", { data: "..." }), "form");

hive.addListener("submit", handler, "default"); // ❌ throws error
```

### Common Instance

A shared, stateful hive for global communication.

```ts
import {
  addCommonListener,
  dispatchCommonEvent,
  Event,
} from "event-hive";

addCommonListener("logout", (event) => {
  console.log("User logged out");
});

dispatchCommonEvent(new Event("logout"));
```

### 🧠 Stateful Mode

Both `EventHive` and `UnconstrainedEventHive` support an optional `stateful` mode:

```ts
const hive = new EventHive(constraint, { stateful: true });
```

When enabled, the hive retains the last dispatched event per type and **automatically replays it** to any new listener added later. This is useful for:

- Late subscribers that need the latest state
- UI components that mount after an event has fired
- Systems where event history matters

Stateful mode is opt-in and defaults to `false`, keeping behavior predictable unless explicitly enabled.

---

## 🧩 Namespaces

Namespaces organize events into domains like `"auth"`, `"form"`, or `"chat"`. You don’t need to declare them ahead of time—they emerge organically, expanding the hive on demand but always trimming it to the minimum required size.

If no namespace is provided, the `"default"` namespace is used automatically.

### Dynamic Namespaces in `UnconstrainedEventHive`

Namespaces are created when you register or dispatch an event, and removed when empty.

### Structured Namespaces in `EventHive`

You define allowed event types per namespace using `EventNamespaceConstraint`. Only declared combinations are permitted.

```ts
const constraint = {
  default: ["login", "logout"],
  form: ["submit", "reset"],
};
```

---

## 🔐 Type Safety

EventHive supports strong typing without imposing it. For full type inference and payload safety, we recommend defining custom event classes with `type` as a static class member.

### ✅ Recommended: Custom Event Classes

```ts
import { Event } from "event-hive";

export interface FooEventPayload {
  value: string;
}

export class FooEvent extends Event<FooEventPayload> {
  public static type = "foo";
  public override payload: FooEventPayload;

  constructor(payload: FooEventPayload) {
    super(FooEvent.type);
    this.payload = payload;
  }
}
```

Now you can use:

```ts
const constraint: EventNamespaceConstraint = {
  default: [FooEvent.type, BarEvent.type], // ✅ the FooEvent class is the single source of truth
}

const fooEventHive = new EventHive(constraint);
```

```ts
addListener<FooEvent>("foo", (event) => {
  console.log(event.payload.value); // ✅ fully typed
});
```

```ts
useHiveEvent<FooEvent>({
  context, // see React section regarding Context
  type: FooEvent.type,
  handler: (event) => {
    console.log(event.payload.value); // ✅ fully typed
  },
});
```

### 🧩 Alternative: Enum-Based Event Types

```ts
export enum EventTypes {
  Login = "login",
  Logout = "logout",
}
```

Use these in constraints and event construction for centralized naming.

---

## 🧭 Strategic Usage

EventHive offers three layers of abstraction:

| Layer                    | Scope       | Control Level | Best For                          |
|--------------------------|-------------|---------------|-----------------------------------|
| `EventHive`              | Private     | 🔒 High       | Shared APIs, long-term structure  |
| `UnconstrainedEventHive`| Private     | ⚙️ Medium     | Internal tools, dynamic systems   |
| Common Instance          | Global-ish  | 🪄 Low        | Quick broadcasts, app-wide events |

Use `EventHive` for strict control, `UnconstrainedEventHive` for flexibility, and the common instance for global concerns.

---

## ⚛️ React Integration

EventHive provides hooks and context utilities for lifecycle-safe event handling. 
These will register Events and handlers in a Context Provider containing an Hive instance and provide a dispatch function. Listeners arer automatically deleted (unsubscribed) when the calling component unmounts. 
*There is no need to keep track of subscriptions.*

### 🧬 Modular Context Setup

EventHive does not provide a Context object of its own. Instead you create and export Contexts in the usual way using `createContext()`, and pass them to the React hooks.

This way any component can use multiple EventHive scopes in different Context Providers simultaneously, e.g. a domain-specific one ('UserSettingEvents') and an app-wide one higher up in the tree.

As a best practice create contexts in their own modules:

#### `UserEventContext.tsx`

```ts
import { createContext } from "react";
export const UserEventContext = createContext();
```

#### `UserSettings.tsx`

```tsx
import { UserEventContext } from "../context";
import { useEventHiveContext } from "event-hive";
import { UserSettingsContainer } from "./components";

const constraint = {
  user: ["login", "logout"],
  form: ["submit", "reset"],
};

const { Provider: UserEventProvider } = useEventHiveContext(UserEventContext, constraint);

return (
  <UserEventProvider>
    <UserSettingsContainer props={someProps} />
  </UserEventProvider>
);
```

### 🎧 Listening to Events

Inside any component:

```tsx
// memoize your event handler to reduce re-rendering
const handler = useCallback<FooEvent>((event) => {
    console.log(event.payload.value);
  }, []);

useHiveEvent<FooEvent>({
  context: UserEventContext,
  type: FooEvent.type,
  handler,
});
```
That's it. Your Event listener will be removed when the component unmounts.
If it was the last current listener for that Event type, the Event will be unregistered.
Hooks fail gracefully if context is missing—allowing safe multi-scoping.

### 📧 Dispatching Events

A dispatch function is returned from the same hook, but no handler option is needed.

```tsx
const { dispatch } = useHiveEvent<FooEvent>({
  context: UserEventContext,
  type: FooEvent.type,
});

dispatch(new FooEvent({ value: "I've been dispatched" }));
```

If you need to both listen to and dispatch an event type from the same component just add the handler prop again.

---

## 📘 API Reference

### 🔧 Classes

#### `Event<P = undefined>`

```ts
new Event(type: string, payload?: P)
```

**Properties:**
- `type: string` - The event type
- `payload: P | undefined` - Optional payload data of generic type P (total freedom here)

#### `UnconstrainedEventHive`

```ts
new UnconstrainedEventHive(options?: EmitterOptions)
```

- `options?: EmitterOptions` - Configuration options
  - `stateful?: boolean` - Whether to replay last event to new listeners (default: false)

**Methods:**

```ts
addListener<T extends IEvent<unknown>>(
  type: string,
  handler: EventCallback<T>,
  namespace?: string
): EventSubscription
```
- `type: string` - Event type to listen for
- `handler: EventCallback<T>` - Function to handle the event: `(event: T) => unknown`
- `namespace?: string` - Optional namespace (default: "default")
- **Returns:** `EventSubscription` - Object with `unsubscribe(): void` method

```ts
removeListener(
  type: string,
  handler: EventCallback<IEvent<unknown>>,
  namespace?: string
): void
```
- `type: string` - Event type
- `handler: EventCallback<IEvent<unknown>>` - Handler function to remove
- `namespace?: string` - Optional namespace (default: "default")

```ts
dispatchEvent<T extends IEvent<unknown>>(
  event: T,
  namespace?: string
): void
```
- `event: T` - Event object to dispatch
- `namespace?: string` - Optional namespace (default: "default")

#### `EventHive<C extends EventNamespaceConstraint>`

```ts
new EventHive(
  constraint: C,
  options?: EmitterOptions
)
```

- `constraint: C` - Event namespace constraint defining allowed event types per namespace
- `options?: EmitterOptions` - Configuration options (same as UnconstrainedEventHive)

**Methods:**

Same as `UnconstrainedEventHive`, but enforces constraints and throws errors for invalid event/namespace combinations.

---

### 🧩 Types

#### `EventNamespaceConstraint`

```ts
type EventNamespaceConstraint = Record<"default" | string, string[]>
```

Maps namespace names to arrays of allowed event types.

#### `EventCallback<T extends IEvent<unknown>>`

```ts
type EventCallback<T extends IEvent<unknown>> = (event: T) => unknown
```

#### `EventSubscription`

```ts
interface EventSubscription {
  unsubscribe(): void;
}
```

#### `EmitterOptions`

```ts
type EmitterOptions = {
  stateful?: boolean;
}
```

---

### 🌐 Common Instance

```ts
addCommonListener(
  type: string,
  handler: EventCallback<IEvent<unknown>>,
  namespace?: string
): EventSubscription
```
- `type: string` - Event type to listen for
- `handler: EventCallback<IEvent<unknown>>` - Event handler function
- `namespace?: string` - Optional namespace (default: "default")
- **Returns:** `EventSubscription`

```ts
removeCommonListener(
  type: string,
  handler: EventCallback<IEvent<unknown>>,
  namespace?: string
): void
```
- `type: string` - Event type
- `handler: EventCallback<IEvent<unknown>>` - Handler function to remove
- `namespace?: string` - Optional namespace (default: "default")

```ts
dispatchCommonEvent(
  event: IEvent<unknown>,
  namespace?: string
): void
```
- `event: IEvent<unknown>` - Event to dispatch
- `namespace?: string` - Optional namespace (default: "default")

---

### ⚛️ React Hooks

#### `useEventHiveContext<T extends EventNamespaceConstraint>`

```ts
useEventHiveContext<T extends EventNamespaceConstraint>(
  context: Context<EventHiveContextProps<T>>,
  constraint: T,
  options?: EmitterOptions
): { Provider: FC<PropsWithChildren> }
```
- `context: Context<EventHiveContextProps<T>>` - React context for the event hive
- `constraint: T` - Event namespace constraint
- `options?: EmitterOptions` - Optional configuration
- **Returns:** Object with `Provider` component

#### `useUnconstrainedEventHiveContext`

```ts
useUnconstrainedEventHiveContext(
  context: Context<UnconstrainedEventHiveContextProps>,
  options?: EmitterOptions
): { Provider: FC<PropsWithChildren> }
```
- `context: Context<UnconstrainedEventHiveContextProps>` - React context for the unconstrained event hive
- `options?: EmitterOptions` - Optional configuration
- **Returns:** Object with `Provider` component

#### `useHiveEvent<T extends IEvent<unknown>>`

```ts
useHiveEvent<T extends IEvent<unknown>>(
  props: UseHiveEventProps<T>
): { dispatch: (event: T) => void }
```

Where `UseHiveEventProps<T>` is:
```ts
interface UseHiveEventProps<T extends IEvent<unknown>> {
  context: Context<EventHiveContextProps<EventNamespaceConstraint> | UnconstrainedEventHiveContextProps>;
  handler?: EventCallback<T>;
  namespace?: string;
  type: string;
}
```
- `context` - React context containing the event hive
- `handler?: EventCallback<T>` - Optional event handler function
- `namespace?: string` - Optional namespace
- `type: string` - Event type
- **Returns:** Object with `dispatch` function

#### `useCommonHiveEvent<T extends IEvent<unknown>>`

```ts
useCommonHiveEvent<T extends IEvent<unknown>>(
  props: UseCommonHiveEventProps<T>
): { dispatch: (event: T) => void }
```

Where `UseCommonHiveEventProps<T>` is:
```ts
type UseCommonHiveEventProps<T extends IEvent<unknown>> = {
  handler?: EventCallback<T>;
  namespace?: string;
  type: string;
}
```
- `handler?: EventCallback<T>` - Optional event handler function
- `namespace?: string` - Optional namespace
- `type: string` - Event type
- **Returns:** Object with `dispatch` function

---

## 🧼 Best Practices

- Use namespaces to organize event domains
- Unsubscribe listeners when no longer needed (automatic in React)
- Choose the right hive for your use case
- Modularize contexts for multi-scoping
- Memoize handlers with `useCallback` in React
- Use custom event classes for full type inference

---

## ❓ FAQ

**Do I need to manually clean up listeners?** 
Only outside React. Hooks handle cleanup automatically.

**What happens if a context is missing?**
Hooks fail silently—safe for optional scopes.

**Can I use EventHive outside React?**
Yes. It’s framework-agnostic.

**Should I use the common instance everywhere?**
Only for global concerns