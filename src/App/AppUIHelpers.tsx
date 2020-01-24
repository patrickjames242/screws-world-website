
import React, { useContext } from 'react';
import {Optional } from 'jshelpers';






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




