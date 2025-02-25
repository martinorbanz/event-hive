import { useContext, useEffect, useMemo } from "react"
import { EventHiveContext } from "../context"
import { IEvent } from "src/Events";
import { EventCallback } from "src/Hive";

interface useEventSubscriptionProps<T extends string, P = undefined> {
    type: T,
    payload?: P,
    namespace?: string,
    handler: EventCallback<IEvent<string, P>>
}

export const useEventSubscription = <T extends string, P>({type, payload, namespace, handler}: useEventSubscriptionProps<T, P>) => {
    const {addListener} = useContext(EventHiveContext);

    const subscription = useMemo(() => addListener(type, handler, namespace), [addListener]);

    useEffect(() => {
        return () => {
            console.log(`unsubscribe from event: ${type}`);
            subscription.unsubscribe();
        }
    });
}