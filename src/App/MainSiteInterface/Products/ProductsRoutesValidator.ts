import { matchPath } from "react-router-dom";
import * as RoutePaths from 'routePaths';
import { getDataObjectForID } from "./ProductsDataHelpers";

export default function isValidProductsRoute(route: string): boolean {
    const match = matchPath<{ id: string }>(route,
        {
            path: [
                RoutePaths.PRODUCTS + "/:id",
                RoutePaths.PRODUCTS,
            ]
        });
    if (!match?.isExact) { return false; }
    if (match?.params.id) {
        const num = Number(match?.params.id);
        return isNaN(num) === false && !!getDataObjectForID(num);
    }
    return true;
}

