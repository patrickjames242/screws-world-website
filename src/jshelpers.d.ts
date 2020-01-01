
import React from 'react';

declare module jshelpers{
    export const SCREWS_WORLD_EMAIL: string;
    export const SCREWS_WORLD_NUMBER: string;

    export function useUpdateEffect(effect: React.EffectCallback, dependencies?: React.DependencyList): void;
    export function fixScrollingIssueBecauseOfTransitionAnimation(): void;
    
}


export = jshelpers;