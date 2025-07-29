import { EventHive, EventNamespace, EventNamespaceConstraint } from '../../Hive';
import { PropsWithChildren, createContext, useEffect, useMemo } from 'react';

interface EventHiveContextProps<T extends EventNamespaceConstraint = { default: EventNamespace }> {
    addListener: EventHive<T>['addListener'];
    dispatchEvent: EventHive<T>['dispatchEvent'];
};

interface EventHiveContextProviderProps<T extends EventNamespaceConstraint = { default: EventNamespace }> extends PropsWithChildren {
    constraint: T;
}

export const EventHiveContext = createContext<EventHiveContextProps>({} as EventHiveContextProps);

export function EventHiveContextProvider <T extends EventNamespaceConstraint>({children, constraint}: EventHiveContextProviderProps<T>)  {
    const eventHive = useMemo(() => new EventHive(constraint), [constraint]);

    const value = useMemo(() => ({
        addListener: eventHive.addListener,
        dispatchEvent: eventHive.dispatchEvent,
    }), [eventHive]);

    useEffect(() => {
        return () => {
            eventHive.deleteAllNamespaces();
        }
    }, [eventHive])

    return (<EventHiveContext.Provider value={value} >{children}</EventHiveContext.Provider>)
}