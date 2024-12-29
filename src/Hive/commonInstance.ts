import { Event } from "../Events"
import { EventSubscription, EventCallback } from "../Observable/Emitter"
import { EventHive } from "./EventHive"

const commonHiveInstance = new EventHive();

export const dispatchCommonEvent = <T extends string, P>(event: Event<T, P>, namespace: string = EventHive.NS_DEFAULT) => commonHiveInstance.dispatchEvent(event, namespace);

export const addCommonListener = <T extends string, P>(type: string, handler: EventCallback<Event<T, P>>, namespace: string = EventHive.NS_DEFAULT): EventSubscription => commonHiveInstance.addListener(type, handler, namespace);

export const removeCommonListener = <T extends string, P>(type: string, handler: EventCallback<Event<T, P>>, namespace: string = EventHive.NS_DEFAULT) => commonHiveInstance.removeListener(type, handler, namespace);