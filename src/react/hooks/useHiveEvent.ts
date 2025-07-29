import { useContext, useEffect, useMemo } from "react";
import { IEvent } from "../../Events";
import { EventCallback } from "../../Hive";
import { EventHiveContext } from "../context";

interface useEventSubscriptionProps<T extends IEvent<unknown>> {
  type: T["type"];
  namespace?: string;
  handler?: EventCallback<T>;
}

export const useHiveEvent = <T extends IEvent<unknown>>({
  type,
  namespace,
  handler,
}: useEventSubscriptionProps<T>) => {
  const { addListener, dispatchEvent } = useContext(EventHiveContext);

  const dispatch = useMemo(
    () => (event: T) => {
      dispatchEvent(event);
    },
    [dispatchEvent]
  );

  useEffect(() => {
    if (handler) {
      const subscription = addListener(
        type,
        handler as EventCallback<IEvent<unknown>>,
        namespace
      );

      return () => {
        console.log(`unsubscribe from event: ${type}`);
        subscription?.unsubscribe();
      };
    }
  }, [addListener, handler, namespace, type]);

  return { dispatch };
};
