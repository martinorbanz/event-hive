# 🐝 EventHive

**EventHive** is a lightweight, type-safe event system for TypeScript applications. It offers dynamic event registration, scoped namespaces, and lifecycle-safe React integration—without the overhead of a full state management library.

Whether you're building a UI, a backend service, or a federated module, EventHive gives you clean, composable event handling with full control and zero to little boilerplate.

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

### 🧠 Next Steps

- Learn the [Core Concepts](#core-concepts)
- Organize your system with [Namespaces](#namespaces)
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

EventHive supports strong typing without imposing it. For full type inference and payload safety, we recommend defining custom event classes.

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
addListener<FooEvent>("foo", (event) => {
  console.log(event.payload.value); // ✅ fully typed
});

useHiveEvent<FooEvent>({
  context,
  type: FooEvent.type,
  handler,
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

### 🧬 Modular Context Setup

Split context setup into two parts:

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

### 🎧 Subscribing to Events

Inside any component:

```tsx
useHiveEvent<FooEvent>({
  context: UserEventContext,
  type: FooEvent.type,
  handler: useCallback((event) => {
    console.log(event.payload.value);
  }, []),
});
```

Hooks fail gracefully if context is missing—allowing safe multi-scoping.

---

## 📘 API Reference

### 🔧 Classes

#### `Event<P = undefined>`

```ts
new Event(type: string, payload?: P)
```

- `type`: string identifier
- `payload`: optional data

#### `UnconstrainedEventHive`

```ts
new UnconstrainedEventHive(options?: { stateful?: boolean })
```

- `stateful`: replay last event to new listeners

**Methods:**

- `addListener(type, handler, namespace?)`
- `removeListener(type, handler, namespace?)`
- `dispatchEvent(event, namespace?)`

#### `EventHive`

```ts
new EventHive(
  constraint: EventNamespaceConstraint,
  options?: { stateful?: boolean }
)
```

- `constraint`: allowed event types per namespace
- `stateful`: same as above

**Methods:**

Same as `UnconstrainedEventHive`, but enforces constraints.

---

### 🧩 Types

#### `EventNamespaceConstraint`

```ts
type EventNamespaceConstraint = {
  [namespace: string]: string[];
}
```

---

### 🌐 Common Instance

```ts
addCommonListener(type, handler)
removeCommonListener(type, handler)
dispatchCommonEvent(event)
```

---

### ⚛️ React Hooks

#### `useEventHiveContext(context, constraint): EventHiveContextProps`

#### `useUnconstrainedEventHiveContext(context): UnconstrainedEventHiveContextProps`

#### `useHiveEvent<TEvent extends Event>(props: UseHiveEventProps<TEvent>)`

#### `useCommonHiveEvent<TEvent extends Event>(props: UseHiveEventProps<TEvent>)`

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