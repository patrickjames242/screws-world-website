import isValidDashboardRoute from "./Dashboard/DashboardRoutesValidator";
import isValidMainSiteInterfaceRoute from "./MainSiteInterface/MainSideInterfaceRoutesValidator";

export default function isValidAppRoute(route: string): boolean{
    return [
        isValidDashboardRoute(route),
        isValidMainSiteInterfaceRoute(route),
    ].some(x => x === true);
}