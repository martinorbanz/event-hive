import { useEffect, useMemo } from "react";
import { IEvent } from "../../events";
import { addCommonListener, dispatchCommonEvent, EventCallback } from "../../hive";
import { UseHiveEventProps } from "./useHiveEvent";

type UseCommonHiveEventProps<T extends IEvent<unknown>> = Omit<
  UseHiveEventProps<T>,
  "context"
>;

export const useCommonHiveEvent = <T extends IEvent<unknown>>({
  handler,
  namespace,
  type,
}: UseCommonHiveEventProps<T>) => {

  const dispatch = useMemo(
    () => (event: T) => {
      dispatchCommonEvent(event);
    },
    []
  );

  useEffect(() => {
    if (handler) {
      const subscription = addCommonListener(
        type,
        handler as EventCallback<IEvent<unknown>>,
        namespace
      );

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [handler, namespace, type]);

  return { dispatch };
};
