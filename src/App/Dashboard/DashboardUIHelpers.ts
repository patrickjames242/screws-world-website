
import React, { useContext } from 'react';
import { Optional, Notification } from 'jshelpers';







export interface DashboardInfo{
    logOut(): void;
    userWillLogOutNotification: Notification;
}

export const DashboardInfoContext = React.createContext<Optional<DashboardInfo>>(null);

export function useDashboardInfo(): Optional<DashboardInfo>{
    return useContext(DashboardInfoContext);
}

export function useIsDashboard(): boolean{
    return useDashboardInfo() !== null;
}



