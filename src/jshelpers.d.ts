
import React from 'react';

declare module jshelpers{
    
    export type Optional<Wrapped> = Wrapped | null;

    export function useSetTitleFunctionality(titleString: Optional<string>): void;

    export function useIsInitialRender(): boolean;

    export const SCREWS_WORLD_EMAIL: string;
    export const SCREWS_WORLD_NUMBER: string;

    export function useUpdateEffect(effect: React.EffectCallback, dependencies?: React.DependencyList): void;
    export function fixScrollingIssueBecauseOfTransitionAnimation(): void;
    export function getIntegerArray(upper: number, lower: number): number[];
}


export = jshelpers;