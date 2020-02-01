
import React from 'react';
import { Optional } from "jshelpers";
import { ProductDataObject, isProduct, isProductCategory, ProductsDataFetchResult } from './ProductsDataHelpers';
import { DashboardProductsRouteURLs, MainUIProductsRouteURLs, DashboardProductsRouteMatchPaths, MainUIProductsRouteMatchPaths } from './ProductsRoutesInfo';
import { matchPath } from 'react-router-dom';
import { useIsDashboard } from 'App/Dashboard/DashboardUIHelpers';



export enum ProductsPageSubjectType {
    INTRO_PAGE,
    CATEGORY,
    PRODUCT,
    EDIT_ITEM,
    CREATE_NEW,
    ERROR,
}


export class ProductsPageSubject{
    constructor(
        readonly type: ProductsPageSubjectType,
        readonly associatedData: Optional<ProductDataObject | ProductDataObject[]>
    ){}
}


function getProductsPageSubjectForRoutePath(routePath: string, productsDataFetchResult: ProductsDataFetchResult): ProductsPageSubject {

    const match = matchPath<{ id?: string }>(routePath, {
        path: [
            DashboardProductsRouteMatchPaths.editProductItem,
            DashboardProductsRouteMatchPaths.createProductItem,
            DashboardProductsRouteMatchPaths.productDetailsView,
            MainUIProductsRouteMatchPaths.productDetailsView,
            DashboardProductsRouteMatchPaths.root,
            MainUIProductsRouteMatchPaths.root,
        ]
    });

    const productItem: Optional<ProductDataObject> = (() => {
        const id = match?.params.id;
        if (id){
            return productsDataFetchResult.getObjectForUniqueID(id);
        } else { return null; }
    })();


    return (() => {
        switch (match?.path) {
            case DashboardProductsRouteMatchPaths.editProductItem:
                if (!productItem){break;}
                return new ProductsPageSubject(ProductsPageSubjectType.EDIT_ITEM, productItem);

            case DashboardProductsRouteMatchPaths.createProductItem:
                return new ProductsPageSubject(ProductsPageSubjectType.CREATE_NEW, null);

            case DashboardProductsRouteMatchPaths.productDetailsView:
            case MainUIProductsRouteMatchPaths.productDetailsView:
                if (isProduct(productItem)) {
                    return new ProductsPageSubject(ProductsPageSubjectType.PRODUCT, productItem);
                } else if (isProductCategory(productItem)){
                    return new ProductsPageSubject(ProductsPageSubjectType.CATEGORY, productItem);
                } else {break;}

            case DashboardProductsRouteMatchPaths.root:
            case MainUIProductsRouteMatchPaths.root:
                return new ProductsPageSubject(ProductsPageSubjectType.INTRO_PAGE, productsDataFetchResult.tree);
        }
        return new ProductsPageSubject(ProductsPageSubjectType.ERROR, null);
    })();
}


export interface ProductsInfoContextValue {
    loadingIsFinished: boolean,
    error: Optional<Error>,
    data: Optional<{
        subject: ProductsPageSubject,
        allTopLevelItems: ProductDataObject[],
    }>
}

// assumes the products data has not been loaded yet if the fetchResult and fetchError parameters are null.
export function computeProductsInfoContextValueFromFetchResult(routePath: string, fetchResult: Optional<ProductsDataFetchResult>, fetchError: Optional<Error>): ProductsInfoContextValue{
    if (fetchResult){
        return {
            loadingIsFinished: true,
            data: {
                subject: getProductsPageSubjectForRoutePath(routePath, fetchResult),
                allTopLevelItems: fetchResult.tree,
            },
            error: null,
        }
    } else if (fetchError){
        return {loadingIsFinished: true, data: null, error: fetchError};
    } else {
        return {loadingIsFinished: false, data: null, error: null};
    }
}






export const ProductsInfoContext = React.createContext<Optional<ProductsInfoContextValue>>(null);


export function useProductsInfoContextValue(): ProductsInfoContextValue{
    const value = React.useContext(ProductsInfoContext);
    if (!value){
        throw new Error("tried to access the projects page subject outside of the Products component. This is not allowed.");
    }
    return value;
}

export function useCurrentProductsPageSubject(): Optional<ProductsPageSubject>{
    return useProductsInfoContextValue().data?.subject ?? null;
}

export function useAllTopLevelProductItems(): ProductDataObject[]{
    return useProductsInfoContextValue().data?.allTopLevelItems ?? [];
}

// returns null if the products page isn't currently displaying the details view for a product or category, or if the products information hasn't been loaded from the server yet.
export function useCurrentProductDetailsViewItem(): Optional<ProductDataObject>{
    const subject = useCurrentProductsPageSubject();
    if (!subject){return null;}
    if (subject.type !== ProductsPageSubjectType.CATEGORY && 
        subject.type !== ProductsPageSubjectType.PRODUCT){
            return null;
        }
    return subject.associatedData as ProductDataObject;
}


export function useToURLForProductItem(productsItem: ProductDataObject): string {
    const isDashboard = useIsDashboard();
    return isDashboard ? 
    DashboardProductsRouteURLs.productDetailsView(productsItem.uniqueProductItemID) : MainUIProductsRouteURLs.productDetailsView(productsItem.uniqueProductItemID);
}




