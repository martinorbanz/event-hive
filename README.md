# event-hive
 
## Dispatch and listen to events from any module.

EventHive lets JavaScript modules exchange information without any knowledge of each other. 
This is mainly intended to make life easier in two architecture/development aspects:
- Loose coupling of *business domains* or *bounded contexts*, i.e. building blocks of your app whose code should remain separated. 
- Avoiding circular dependencies.

It will work in bundled applications, NodeJS and ModuleFederation.

## Table of contents

- [Installation](#installation)
- [General idea](#general-idea)
- [Scopes and Namespaces](#scopes-and-namespaces)
- Package exports
  - [Classes](#classes)
  - [Common methods](#common-methods)
- [Basic usage](#basic-usage)
- [Payload events](#payload-events)
- [Typed payload events](#typed-payload-events)
- [Removing Listeners](#removing-listeners)

## Installation

Using npm:
```
npm install event-hive
```

Using yarn:
```
yarn add event-hive
```

## General idea

EventHive dispatching and listening is modeled after classic DOM Events, and uses principles of Observables to allow that for any kind of JS/TS module. Dispatch an event and any module that registerd a listener (or will in the future) will get it. The dispatcher does not need to know who is listening and the listeners do not need to know who is dispatching.

Events can be organized into namespaces for separation of concerns.

You can choose wether to distribute in the `Common` scope which runs application wide - even cross-application in ModuleFederation, or confined to a part of your app for access control.

### No more worres about circular dependencies

Imagine two modules `a` and `b` that shall exchange data. They can not import each other since that would cause a circular dependency. You could could create an Observable to emit information and a consumer function to take it in on both of them, and build a module `c` on top that imports `a` and `b`, connectiong their data traffic. That could quickly get error prone as more participants come in. And maybe the communication module needs to talk to another one. 

`EventHive` untangles that. You can just emit data from `a` and listen to it in `b` ***and vice versa***, without worrying about anything else.

## Scopes and Namespaces

These concepts are good to know, but it's possible to skip them and just start using the `common methods` listed below without any prior knowledge.

### Scopes

`EventHive` operates in two`scopes`, `common` and `private`. 
The `common scope` is always defined as *all modules importing EventHive from the same source*. So if it is installed in `node_modules` and all imports take place from there, your entire application will share the same `common scope` in `EventHive`. 
If you are using ModuleFederation and federation members share `EventHive` as a resource, these members will also share the same `common scope`, meaning they can exchange common `Events`.

The `common scope` is accessed by using the `common methods`:
```ts
import { addCommonListener, removeCommonListener, dispatchCommonEvent } from 'event-hive'
```

If you want to limit event accessibility to a certain part of your app, say a bounded context, you can use a `private scope` simply by instantiating the `EventHive` class in module available to the desired app layer and exposing its instance methods.
```ts
import { EventHive } from 'event-hive'

const EventHive = new EventHive()
export const { addListener, removeListener, dispatchEvent } = EventHive
```
Or, if you don't need to access the instance otherwise, just:
```ts
export const { addListener, removeListener, dispatchEvent } = new EventHive()
```
In a single page application, that module would typically be an `Angular Service` or a `React Context Provider`.

### Namespaces

Every `Event` in `EventHive` takes place in a `namespace`. If no specification is made, the `Event` will be dispatched in the `"default"` `namespace`. `Namespaces` are referenced by passing them as `String` arguments to the `EventHive` methods (see examples).

`Namespaces` are automatically managed. So they are created if needed and removed when no more `Events` are registered to them. An `Event` is removed from a `namespace` when after the last listener has been removed from it.

## Member exports from `event-hive`

### Classes

#### **`Event`**
The base class for all `Events` being emitted or listend to. it has no instance methods except the constructor.
`Constructor arguments`:
- `type`: a `String` containing the event type, or name. E.g.: `"ApplicationReady"`, `"AwesomeEvent"`
- `payload` (optional): the data transported by the `Event`. It can be any kind of object or data type available in JavaScript. See [examples](#payload-events). Defaults to 'null'
- `namespace` (optional): a `String` referencing the `namespace` in which en `Event` should be dispatched or listened to. Defaults to `"default"`.

Extend from this class to create your typed `Events`. When using a payload, `Event` and inheriting classes require an input type (see [examples](#typed-payload-events))

#### **`EventHive`**
The module managing all of the `Event` traffic. It is written in class syntax, so all of its methods are publicly available. Look at the class to see all of them, but the ones you will be using are:
- #### `dispatchEvent<T>(event: Event<T>, namespace: string)`: 
  - `event`: A (optionally typed) instance of the `Event` class or a class inheriting from it (i.e. implementing the `IEvent` interface)
  - `namespace` (optional): A `String`referencing the namespace to listen in. Defaults to `"default"` if not provided.

- #### `addListener<T>(type: string, handler: EventCallback<Event<T>>, namespace?: string)`: 
  - `type`: A `String` identifying this `Event`.
  - `handler` (optional): Function that receives an `Event` as argument, or an object inheriting from `Event`
  - `namespace` (optional): A `String`referencing the namespace to listen in. Defaults to `"default"` if not provided.

- #### `removeListener<T>(type: string, handler: EventCallback<Event<T>>, namespace?: string)`:
  - `type`: A `String` identifying this `Event`.
  - `handler` (optional): Function that receives an `Event` as argument, or an object inheriting from `Event`
  - `namespace` (optional): A `String`referencing the namespace to listen in. Defaults to `"default"` if not provided.


### Common Methods

These methods will be your starting point if you want to use `EventHive` without imposing specific restrictions.
They mirror those of the `EventHive` class (in fact that is where they are coming from) but operate in the [`common scope`](#scopes).

- **`dispatchCommonEvent`**: see [EventHive.dispatchEvent](#dispatcheventtevent-eventt-namespace-string) for signature and [examples](#basic-usage) for usage
- **`addCommonListener`**: see [EventHive.addListener](#addlistenerttype-string-handler-eventcallbackeventt-namespace-string) for signature and [examples](#basic-usage) for usage
- **`removeCommonListener`**: see [EventHive.removeListener](#removelistenerttype-string-handler-eventcallbackeventt-namespace-string) for signature and [examples](#removing-listeners) for usage



## Basic usage

`EventHive` `Events` have two properties:
- `type`: a `string` representing the name of the `Event`, just like in a DOM Event
- `payload`: data sent through the `Event`, which can be absolutely anything. If no value is provided, it will default to `null`. 


So the most basic use case is to just dispatch a string, say to announce your application is fully bootstrapped.

In module1:
```ts
import { dispatchCommonEvent, Event } from 'event-hive'

dispatchCommonEvent(new Event('ApplicationReady'))
```
And in module2:
```ts
import { addListener, Event } from 'event-hive'

addCommonListener('ApplicationReady', () => {
  // do great things
})
```
**Note** that the order of declarations does <b>not</b> matter here. If a listener is registered after an `Event` has been emitted, **it will always receive the last value dispatched for this `Event` type.**

### TypeScript

In TypeScript, when not null the value has to be typed first as well using 
```ts
type Foo = { foo: string }
```
and then 
```ts
dispatchCommonEvent(new Event<Foo>('FooEvent', { foo: 'bar' }))
```

## Payload Events

In most cases, you will want to transport some data when emitting `Events`. This is where `Event.payload` comes in.
You can provide the payload directly as an argument to the `Event` class constructor:
```ts
import { dispatchCommonEvent, Event } from 'event-hive'

const eventPayload = {
  foo: 'bar'
}

dispatchCommonEvent(new Event('AwesomeEvent', eventPayload))
```

This would work for JS, but using TypeScript, in the listener function you would have to cast the payload type:
```ts
import { addCommonListener, Event } from 'event-hive'

interface Foo {
  foo: string
}

addCommonListener('AwesomeEvent', (event: Event<Foo>) => {
  const payload = event.payload as Foo
  console.log(event.payload) // expected: { foo: 'bar' }
})
```

## Typed Payload Events

When using TypeScript and regarding the code above, it is strongly recommended that you define your own `Events` and input types, extending from the `Event` `class`. So a more near-real-world example would look like this:

```ts
// types.ts
export interface AwesomeData {
  foo: string
}
```

```ts
// events.ts
import { Event } from 'event-hive'
import { AwesomeData } from './types'

export const AWESOME_EVENT_TYPE = 'AwesomeEvent' // this is optional, but helps to avoid typos

export class AwesomeEvent extends Event<AwesomeData> {
  constructor(payload: AwesomeData) {
    super(AWESOME_EVENT_TYPE, payload)
    this.payload = payload // this is just for safe type inference
  }
}
```

```ts
// module1.ts
import { dispatchCommonEvent } from 'event-hive'
import { AwesomeEvent, AWESOME_EVENT_TYPE } from './events'

dispatchCommonEvent(new AwesomeEvent({
  foo: 'bar'
}))
```

```ts
// module2.ts
import { addCommonListener } from 'event-hive'
import { AwesomeEvent, AWESOME_EVENT_TYPE } from './events'

addCommonListener(AWESOME_EVENT_TYPE, (event: AwesomeEvent) => {
  console.log(event.paload.foo) // 'bar'
})
```

## Removing listeners

As mentioned above, `Event` emission and listening is powered by Observables (in this case not from a library but stripped down to the most necessary funtionability). Thus it is important to remove listeners when no longer needed (as with the `window.addEventListener` method). Otherwise the `Object` registering the listener will not be ellegible for garbage collection, but more importantly the listener functions will continue to be executed if further `Evets` are emitted, which might not at all be what you want.

If your listening component remains alive throughout the application lifecycle you do not need to worry about this. If not. here's what you do:

### removing listeners at some point in time

If want to set up an `Event`listener at component mount time (or whenever) and remove it later, store the `handler` function in a variable first:
```ts
// module2.ts
import { addCommonListener, removeListener } from 'event-hive'
import { AwesomeEvent, AWESOME_EVENT_TYPE } from './events'

const awesomeEventHandler = (event: AwesomeEvent) => {
  console.log(event.paload.foo) // 'bar'
}

addCommonListener(AWESOME_EVENT_TYPE, awesomeEventHandler)

// on unmount / at some later point in time
removeListener(AWESOME_EVENT_TYPE, awesomeEventHandler)
```

The `removeListener` method requiers an exact reference, passed by value, to the function registered as the `handler`, so just re-typing it will not work.

### one-time-listeners

If you want your `Event` `handler` function to run only once, you can use the `removeListener` call like this:
```ts
import { addCommonListener, removeListener } from 'event-hive'
import { AwesomeEvent, AWESOME_EVENT_TYPE } from './events'

const awesomeEventHandler = (event: AwesomeEvent) => {
  console.log(event.paload.foo) // 'bar'
  removeListener(AWESOME_EVENT_TYPE, awesomeEventHandler)
}

addCommonListener(AWESOME_EVENT_TYPE, awesomeEventHandler)
```

That would leave the `awesomeEventHandler` reference in the module scope. If you want to listen to an `Event`once and then send it all straight to garbage collection, use an immediately invoked function (IIFE):
```ts
import { addCommonListener, removeListener } from 'event-hive'
import { AwesomeEvent, AWESOME_EVENT_TYPE } from './events'

addCommonListener(
  AWESOME_EVENT_TYPE, 
  (() => {
    const handler = (event: AwesomeEvent) => {
      console.log('received Event:', event.type) // 'AwesomeEvent'
      removeListener(AWESOME_EVENT_TYPE.TYPE, handler)
    }
    return handler
  })(),
)
```

### Unsubscribing

As mentioned above `EventHive` is powered by an Observable-like idea, so calling `addListener` or `addCommonListener` will return a `Subscription` object with an `unsubscribe` method. So you can also remove a listener this way:
```ts
import { addCommonListener, removeListener } from 'event-hive'
import { AwesomeEvent, AWESOME_EVENT_TYPE } from './events'

const awesomeListener = addCommonListener(AWESOME_EVENT_TYPE, (event: AwesomeEvent) => {
  console.log(event.paload.foo) // 'bar'
})

// later
awesomeListener.unsubscribe()
```

Or for a one-timer:
```ts
const awesomeListener = addCommonListener(AWESOME_EVENT_TYPE, (event: AwesomeEvent) => {
  console.log(event.paload.foo) // 'bar'
  awesomeListener.unsubscribe()
})
```

## Lifecycles

If you are using an SPA framework be sure to remove all listeners one way or the other at the end of your module lifecycle (while unmounting). 

### React

While in most cases the methods of `EventHive` can be used anywhere, in functional React where components are always rendered multiple times, `addListener` calls should be placed in a `React.useEffect()` that runs only once, and removed in the return statement.

## NodeJS

`EventHive` and the `common scope` work in NodeJS applications the same way as in bundled scripts for the browser. Just use `require` instead of `import`:  
```js
const { dispatchCommonEvent } = require('event-hive')
```
If you are using `ts-node` the implementation works exactly as in the TypeScript examples above.


