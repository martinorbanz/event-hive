import { PropsWithChildren } from 'react';
import { EventHive, EventNamespaceConstraint } from '../../Hive';
import { UnconstrainedEventHive } from '../../Hive/UnconstrainedEventHive';

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