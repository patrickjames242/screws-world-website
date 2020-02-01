
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { matchPath, match } from "react-router-dom";
import * as RoutePaths from 'topLevelRoutePaths';
import { ProductItemUniqueIDGenerator } from "./ProductsDataHelpers";

const dashboardBaseURL = RoutePaths.DASHBOARD;
const productsBaseURL = RoutePaths.PRODUCTS;

const editProductItemBaseURL = dashboardBaseURL + "/edit-product-item";





export const MainUIProductsRouteMatchPaths = {
    root: productsBaseURL,
    productDetailsView: productsBaseURL + "/:id", 
}

export const MainUIProductsRouteURLs = {
    root: MainUIProductsRouteMatchPaths.root,
    productDetailsView(productItemUniqueID: string){
        return productsBaseURL + "/" + productItemUniqueID;
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
    productDetailsView(productItemUniqueID: string){
        return dashboardBaseURL + "/" + productItemUniqueID;
    },
    createProductItem: DashboardProductsRouteMatchPaths.createProductItem,
    editProductItem(productItemUniqueID: string){
        return editProductItemBaseURL + "/" + productItemUniqueID;
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
        return ProductItemUniqueIDGenerator.isValidUniqueID(match?.params.id);
    } else {
        return true;
    }
}

