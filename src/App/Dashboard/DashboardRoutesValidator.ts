import { matchPath } from "react-router-dom";
import * as RoutePaths from 'routePaths';
import { getDataObjectForID } from "App/MainSiteInterface/Products/ProductsDataHelpers";



export default function isValidDashboardRoute(route: string): boolean {
    const match = matchPath<{ id: string }>(route,
        {
            path: [
                RoutePaths.DASHBOARD_LOGIN,
                RoutePaths.DASHBOARD + "/:id",
                RoutePaths.DASHBOARD,
            ]
        });
    if (!match?.isExact) { return false; }
    if (match?.params.id) {
        const num = Number(match?.params.id);
        return isNaN(num) === false && !!getDataObjectForID(num);
    }
    return true;
}


