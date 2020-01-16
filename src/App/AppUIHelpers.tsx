
import React, { useContext } from 'react';
import {Optional, Notification } from 'jshelpers';


// screen dimmer context

export interface ScreenDimmerFunctions{
    setVisibility?: (isVisible: boolean, animate: boolean) => void;
    dimmerWasClickedNotification?: Notification;
}

export const ScreenDimmerFunctionsContext = React.createContext<Optional<ScreenDimmerFunctions>>(null);


export function useScreenDimmerFunctions(): ScreenDimmerFunctions{
    return useContext(ScreenDimmerFunctionsContext)!;
}



// dashboard context

export interface DashboardInfo{
    logOut(): void;
}

export const DashboardInfoContext = React.createContext<Optional<DashboardInfo>>(null);

export function useDashboardInfo(): Optional<DashboardInfo>{
    return useContext(DashboardInfoContext);
}

export function useIsDashboard(): boolean{
    return useDashboardInfo() !== null;
}




