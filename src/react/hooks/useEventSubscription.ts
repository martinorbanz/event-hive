import { useContext, useEffect, useMemo } from "react"
import { EventHiveContext } from "../context"
import { Event } from "src/Events";
import { EventCallback } from "src/Hive";

interface useEventSubscriptionProps<T extends string, P = undefined> {
    type: T,
    payload?: P,
    namespace?: string,
    handler: EventCallback<Event<string, unknown>>
}

export const useEventSubscription = <T extends string, P>({type, payload, namespace, handler}: useEventSubscriptionProps<T, P>) => {
    const {addListener} = useContext(EventHiveContext);

    const subscription = useMemo(() => addListener(type, handler, namespace), [addListener]);

    useEffect(() => {
        return () => {
            subscription.unsubscribe();
        }
    });
}