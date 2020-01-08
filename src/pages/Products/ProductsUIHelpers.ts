
import React from 'react';

import * as NavBarSelection from 'random-components/NavBar/SelectionType';
import { Optional } from "jshelpers";
import {ProductDataObject} from './ProductsDataHelpers';


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

export function getToURLForProductsItem(productsItem: ProductDataObject): string {
    const pathName = NavBarSelection.getInfoForSelection(NavBarSelection.SelectionType.Products).routePath;
    return pathName + "/" + productsItem.id;
}