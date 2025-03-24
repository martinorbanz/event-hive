import { useCallback, useContext, useEffect, useState } from "react"
import { EventHiveContext } from "../context"
import { IEvent } from "src/Events";
import { EventCallback, EventSubscription } from "src/Hive";

interface useEventSubscriptionProps<T extends IEvent> {
    type: T['type'],
    payload?: T['payload'],
    namespace?: string,
    handler: EventCallback<T>
}

export const useEventSubscription = <T extends IEvent>({type, payload, namespace, handler}: useEventSubscriptionProps<T>) => {
    const {addListener} = useContext(EventHiveContext);

    const [subscription, setSubscription] = useState<EventSubscription>();

    subscription?.unsubscribe();

    setSubscription(addListener(type, handler, namespace))

    useEffect(() => {
        return () => {
            console.log(`unsubscribe from event: ${type}`);
            subscription?.unsubscribe();
        }
    });
}