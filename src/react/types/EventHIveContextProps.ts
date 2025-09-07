import { PropsWithChildren } from 'react';
import { EventHive, EventNamespaceConstraint } from '../../hive';
import { UnconstrainedEventHive } from '../../hive/UnconstrainedEventHive';

export type UnconstrainedEventHiveContextProps = PropsWithChildren<{
    addListener: UnconstrainedEventHive['addListener'];
    dispatchEvent: UnconstrainedEventHive['dispatchEvent'];
}>;

export type EventHiveContextProps<
    T extends EventNamespaceConstraint
> = PropsWithChildren<{
    addListener: EventHive<T>['addListener'];
    dispatchEvent: EventHive<T>['dispatchEvent'];
}>;