import { Event } from "../Events"
import { EventSubscription, EventCallback } from "../Observable/Emitter"
import { EventHive, NS_DEFAULT } from "./EventHive"
export { EventHive }

export const dispatchCommonEvent = (event: Event<unknown>, namespace: string = NS_DEFAULT) => EventHive.singleton.dispatchEvent(event, namespace)

export const addCommonListener = <T>(type: string, handler: EventCallback<Event<T>>, namespace: string = NS_DEFAULT): EventSubscription => EventHive.singleton.addListener(type, handler, namespace)

export const removeCommonListener = <T>(type: string, handler: EventCallback<Event<T>>, namespace: string = NS_DEFAULT) => EventHive.singleton.removeListener(type, handler, namespace)
