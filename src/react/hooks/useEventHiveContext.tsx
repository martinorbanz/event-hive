import { PropsWithChildren, useEffect, useMemo, type Context, type FC } from 'react';
import { EmitterOptions, EventHive, EventNamespaceConstraint } from '../../Hive';
import { EventHiveContextProps } from '../types';

function createEventHiveProvider<T extends EventNamespaceConstraint>(
    context: Context<EventHiveContextProps<T>>,
    constraint: T,
    options?: EmitterOptions,
): FC<PropsWithChildren> {
    return function EventHiveProvider(props) {
        const { children } = props;
        const eventHive = useMemo(() => new EventHive(constraint, options), []);

        const value = useMemo(() => ({
            addListener: eventHive.addListener,
            dispatchEvent: eventHive.dispatchEvent,
        }), [eventHive]);

        useEffect(() => {
            return () => {
                eventHive.deleteAllNamespaces();
            };
        }, [eventHive]);

        return <context.Provider value={value}>{children}</context.Provider>;
    };
}

export function useEventHiveContext<T extends EventNamespaceConstraint>(
    context: Context<EventHiveContextProps<T>>,
    constraint: T,
    options?: EmitterOptions,
): { Provider: FC<PropsWithChildren> } {

    const Provider = useMemo(
        () => createEventHiveProvider(context, constraint, options),
        [],
    );

    return { Provider };
};
