
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { matchPath, match } from "react-router-dom";
import * as RoutePaths from 'topLevelRoutePaths';
import { getDataObjectForID } from "./ProductsDataHelpers";

const dashboardBaseURL = RoutePaths.DASHBOARD;
const productsBaseURL = RoutePaths.PRODUCTS;

const editProductItemBaseURL = dashboardBaseURL + "/edit-product-item";





export const MainUIProductsRouteMatchPaths = {
    root: productsBaseURL,
    productDetailsView: productsBaseURL + "/:id", 
}

export const MainUIProductsRouteURLs = {
    root: MainUIProductsRouteMatchPaths.root,
    productDetailsView(id: number){
        return productsBaseURL + "/" + id;
    }    
}

export function isValidMainInterfaceProductsRoute(route: string): boolean{
    const match = matchPath<{ id?: string }>(route,
        {
            path: [
                MainUIProductsRouteMatchPaths.productDetailsView,
                MainUIProductsRouteMatchPaths.root,
            ]
        });
    return isMatchValid(match);
}






export const DashboardProductsRouteMatchPaths = {
    root: dashboardBaseURL,
    productDetailsView: dashboardBaseURL + "/:id",
    createProductItem: dashboardBaseURL + "/create-product-item",
    editProductItem: editProductItemBaseURL + "/:id",
}

export const DashboardProductsRouteURLs = {
    root: DashboardProductsRouteMatchPaths.root,
    productDetailsView(id: number){
        return dashboardBaseURL + "/" + id;
    },
    createProductItem: DashboardProductsRouteMatchPaths.createProductItem,
    editProductItem(id: number){
        return dashboardBaseURL + editProductItemBaseURL + "/" + id;
    }
}

export function isValidDashboardProductsRoute(route: string): boolean{
    const match = matchPath<{id?: string}>(route, {path: [
        DashboardProductsRouteMatchPaths.editProductItem,
        DashboardProductsRouteMatchPaths.createProductItem,
        DashboardProductsRouteMatchPaths.productDetailsView,
        DashboardProductsRouteMatchPaths.root,
    ]});
    return isMatchValid(match);
}




function isMatchValid(match: match<{id?: string}> | null): boolean{
    if (!match?.isExact) { return false; }
    if (match?.params.id) {
        const num = Number(match?.params.id);
        return isNaN(num) === false && !!getDataObjectForID(num);
    } else {
        return true;
    }
}

