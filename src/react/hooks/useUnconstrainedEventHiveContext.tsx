import { PropsWithChildren, useEffect, useMemo, type Context, type FC } from 'react';
import { EmitterOptions, UnconstrainedEventHive } from '../../hive';
import { UnconstrainedEventHiveContextProps } from '../types';

export function useUnconstrainedEventHiveContext(
    context: Context<UnconstrainedEventHiveContextProps>,
    options?: EmitterOptions
): { Provider: FC<PropsWithChildren> } {

    const Provider: FC<PropsWithChildren> = (props) => {
        const { children } = props;
        const eventHive = useMemo(() => new UnconstrainedEventHive(options), []);

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
