import { IEvent } from "../events";
import { EventCallback, EventSubscription } from "../observable";
import { UnconstrainedEventHive as EventHive } from "./UnconstrainedEventHive";

const commonHiveInstance = new EventHive({ stateful: true });

export const dispatchCommonEvent = (event: IEvent<unknown>, namespace: string = EventHive.NS_DEFAULT) => commonHiveInstance.dispatchEvent(event, namespace);

export const addCommonListener = (type: string, handler: EventCallback<IEvent<unknown>>, namespace: string = EventHive.NS_DEFAULT): EventSubscription => commonHiveInstance.addListener(type, handler, namespace);

export const removeCommonListener = (type: string, handler: EventCallback<IEvent<unknown>>, namespace: string = EventHive.NS_DEFAULT) => commonHiveInstance.removeListener(type, handler, namespace);