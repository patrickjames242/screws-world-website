import React, { useContext } from "react";
import { Optional } from "jshelpers";
import { RequestsRequiringAuthentication } from "API";

export interface DashboardInfo {
  logOut(): void;
  requestsRequiringAuth: RequestsRequiringAuthentication;
}

export const DashboardInfoContext =
  React.createContext<Optional<DashboardInfo>>(null);

export function useDashboardInfo(): Optional<DashboardInfo> {
  return useContext(DashboardInfoContext);
}

export function useRequestsRequiringAuth(): RequestsRequiringAuthentication {
  const info = useDashboardInfo();
  if (!info) {
    throw new Error(
      "you tried to access requestsRequiringAuth from a component that is not within the dashboard component. This is not allowed."
    );
  } else {
    return info.requestsRequiringAuth;
  }
}

export function useIsDashboard(): boolean {
  return useDashboardInfo() !== null;
}
