import { EventHive, EventNamespaceConstraint } from '../../Hive';
import { ReactNode, createContext, useEffect, useMemo } from 'react';

interface EventHiveContextProps<T extends EventNamespaceConstraint = undefined> {
    addListener: EventHive<T>['addListener'];
    createEvent: EventHive<T>['createEvent'];
    dispatchEvent: EventHive<T>['dispatchEvent'];
};

interface EventHiveContextProviderProps {
    children: ReactNode;
    constraint?: EventNamespaceConstraint;
}

export const EventHiveContext = createContext<EventHiveContextProps>({} as EventHiveContextProps);

export function EventHiveContextProvider <T>({children, constraint}: EventHiveContextProviderProps)  {
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