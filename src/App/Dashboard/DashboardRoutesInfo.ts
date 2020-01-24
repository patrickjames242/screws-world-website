import { matchPath } from "react-router-dom";
import {DASHBOARD as dashboardBaseURL} from 'topLevelRoutePaths';
import { isValidDashboardProductsRoute } from "App/MainSiteInterface/Products/ProductsRoutesInfo";

export const DashboardRouteURLs = {
    dashboard: dashboardBaseURL,
    dashboardLogIn: dashboardBaseURL + "/login",
}

export function isValidDashboardRoute(route: string): boolean {
    const match = matchPath<{ id: string }>(route,
        {
            path: [
                DashboardRouteURLs.dashboardLogIn,
                DashboardRouteURLs.dashboard,
            ]
        });
    return match?.isExact === true || isValidDashboardProductsRoute(route) === true;
}


