import { EventHive, EventNamespaceConstraint } from '../../Hive';
import { ReactNode, createContext, useEffect, useMemo } from 'react';

interface EventHiveContextProps<T = undefined> {
    addListener: EventHive<T>['addListener'];
    createEvent: EventHive<T>['createEvent'];
    dispatchEvent: EventHive<T>['dispatchEvent'];
};

interface EventHiveContextProviderProps<T = undefined> {
    children: ReactNode;
    constraint?: EventNamespaceConstraint<T>;
}

export const EventHiveContext = createContext<EventHiveContextProps>({} as EventHiveContextProps);

export function EventHiveContextProvider <T>({children, constraint}: EventHiveContextProviderProps<T>)  {
    const eventHive = useMemo(() => new EventHive(constraint), [constraint]);

    const value = useMemo(() => ({
        addListener: eventHive.addListener,
        createEvent: eventHive.createEvent,
        dispatchEvent: eventHive.dispatchEvent,
    }), [eventHive]);

    useEffect(() => {
        return () => {
            eventHive.deleteAllNamespaces();
        }
    })

    return (<EventHiveContext.Provider value={value} >{children}</EventHiveContext.Provider>)
}