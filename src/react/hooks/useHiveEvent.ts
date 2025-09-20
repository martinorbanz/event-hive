import { useContext, useEffect, useMemo, type Context } from "react";
import { IEvent } from "../../events";
import { EventCallback, EventNamespaceConstraint } from "../../hive";
import { EventHiveContextProps, UnconstrainedEventHiveContextProps } from "../types";

export interface UseHiveEventProps<T extends IEvent<unknown>> {
  context: Context<EventHiveContextProps<EventNamespaceConstraint> | UnconstrainedEventHiveContextProps>;
  handler?: EventCallback<T>;
  namespace?: string;
  type: string;
}

export const useHiveEvent = <T extends IEvent<unknown>>({
  context,
  handler,
  namespace,
  type,
}: UseHiveEventProps<T>) => {
  const { addListener, dispatchEvent } = useContext(context);

  const dispatch = useMemo(
    () => (event: T) => {
      dispatchEvent?.(event);
    },
    [dispatchEvent]
  );

  useEffect(() => {
    if (handler && addListener) {
      const { unsubscribe } = addListener(
        type,
        handler as EventCallback<IEvent<unknown>>,
        namespace
      );

      return () => {
        unsubscribe();
      };
    }
  }, [addListener, handler, namespace, type]);

  return { dispatch };
};