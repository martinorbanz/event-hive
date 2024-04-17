import { Event } from "../Events"
import { EventSubscription, EventCallback } from "../Observable/Emitter"
import { EventHive, NS_DEFAULT } from "./EventHive"

const commonHiveInstance = new EventHive();

export const dispatchCommonEvent = (event: Event<unknown>, namespace: string = NS_DEFAULT) => commonHiveInstance.dispatchEvent(event, namespace);

export const addCommonListener = <T>(type: string, handler: EventCallback<Event<T>>, namespace: string = NS_DEFAULT): EventSubscription => commonHiveInstance.addListener(type, handler, namespace);

export const removeCommonListener = <T>(type: string, handler: EventCallback<Event<T>>, namespace: string = NS_DEFAULT) => commonHiveInstance.removeListener(type, handler, namespace);