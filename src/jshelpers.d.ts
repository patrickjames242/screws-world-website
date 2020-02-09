
import React from 'react';

declare module jshelpers{
    
    export type Optional<Wrapped> = Wrapped | null;

    export function useSetTitleFunctionality(titleString: Optional<string>): void;

    export function useIsInitialRender(): boolean;

    export const SCREWS_WORLD_EMAIL: string;
    export const SCREWS_WORLD_NUMBER: string;

    export function useUpdateEffect(effect: React.EffectCallback, dependencies?: React.DependencyList): void;

    export function useBlockHistoryWhileMounted(message: string, shouldBlock: boolean = true);
    
    export function getIntegerArray(upper: number, lower: number): number[];

    export type NotificationListener<InfoType> = (info: InfoType) => void;


    export class Notification<InfoType = {}>{
        post(info: InfoType): void;
        addListener(listener: NotificationListener<InfoType>): () => void;
        removeListener(listener: NotificationListener<InfoType>): void;
    }

    export const allHistoryBlocksShouldBeRemoved: Notification<{}>;


   

}


export = jshelpers;