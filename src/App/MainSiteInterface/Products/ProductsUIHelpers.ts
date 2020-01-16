
import React from 'react';
import {PRODUCTS as productsRouteURL, DASHBOARD as dashboardRouteURL } from 'routePaths';

import { Optional } from "jshelpers";
import {ProductDataObject} from './ProductsDataHelpers';
import { useIsDashboard } from 'App/AppUIHelpers';


export const ProductsDataContext = React.createContext<Optional<{
    currentlySelectedItem: Optional<ProductDataObject>,
    allProductItems: ProductDataObject[],
}>>(null);

export function useCurrentlySelectedItem(): Optional<ProductDataObject> {
    const productsData = React.useContext(ProductsDataContext);
    if (productsData) {
        return productsData.currentlySelectedItem;
    } else { return null; }
}

export function useAllProductItems(): ProductDataObject[] {
    return React.useContext(ProductsDataContext)!.allProductItems;
}

export function useToURLForProductItem(productsItem: ProductDataObject): string {
    const isDashboard = useIsDashboard();
    const rootPath = isDashboard ? dashboardRouteURL : productsRouteURL;
    return rootPath + "/" + productsItem.id;
}


