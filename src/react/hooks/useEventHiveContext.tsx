import { PropsWithChildren, useEffect, useMemo, type Context, type FC } from 'react';
import { EmitterOptions, EventHive, EventNamespaceConstraint } from '../../hive';
import { EventHiveContextProps } from '../types';

export function useEventHiveContext<T extends EventNamespaceConstraint>(
    context: Context<EventHiveContextProps<T>>,
    constraint: T,
    options?: EmitterOptions,
): { Provider: FC<PropsWithChildren> } {

    const Provider: FC<PropsWithChildren> = (props) => {
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

    return { Provider };
};
