import { useContext, useEffect, useMemo } from "react";
import { IEvent } from "../../Events";
import { EventCallback } from "../../Hive";
import { EventHiveContext } from "../context";

interface useEventSubscriptionProps<T extends IEvent<unknown>> {
  type: T["type"];
  namespace?: string;
  handler: EventCallback<T>;
}

export const useEventSubscription = <T extends IEvent<unknown>>({
  type,
  namespace,
  handler,
}: useEventSubscriptionProps<T>) => {
  const { addListener } = useContext(EventHiveContext);

  const subscription = useMemo(
    () =>
      addListener(type, handler as EventCallback<IEvent<unknown>>, namespace),
    [addListener, type, handler, namespace]
  );

  useEffect(() => {
    return () => {
      console.log(`unsubscribe from event: ${type}`);
      subscription.unsubscribe();
    };
  }, [subscription, type]);
};
