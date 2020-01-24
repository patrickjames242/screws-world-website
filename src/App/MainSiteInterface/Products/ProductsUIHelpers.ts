
import React from 'react';
import { Optional } from "jshelpers";
import { ProductDataObject, getDataObjectForID, isProduct, isProductCategory } from './ProductsDataHelpers';
import { useIsDashboard } from 'App/AppUIHelpers';
import { DashboardProductsRouteURLs, MainUIProductsRouteURLs, DashboardProductsRouteMatchPaths, MainUIProductsRouteMatchPaths } from './ProductsRoutesInfo';
import { matchPath } from 'react-router-dom';






export enum ProductsPageSubjectType {
    INTRO_PAGE,
    CATEGORY,
    PRODUCT,
    EDIT_ITEM,
    CREATE_NEW,
}

type ProductsPageSubjectAssociatedData = ProductDataObject[] | ProductDataObject | null;


export interface ProductsPageSubject {
    type: ProductsPageSubjectType,
    associatedData: ProductsPageSubjectAssociatedData,
}

export function getProductsPageSubjectForRoutePath(routePath: string): Optional<ProductsPageSubject> {

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
        const id = Number(match?.params.id);
        if (isNaN(id)) { return null; }
        return getDataObjectForID(id);
    })();

    if (!match?.isExact) { return null; }

    return (() => {
        switch (match.path) {
            case DashboardProductsRouteMatchPaths.editProductItem:
                return {type: ProductsPageSubjectType.EDIT_ITEM, associatedData: productItem};
                
            case DashboardProductsRouteMatchPaths.createProductItem:
                return {type: ProductsPageSubjectType.CREATE_NEW, associatedData: null};

            case DashboardProductsRouteMatchPaths.productDetailsView:
            case MainUIProductsRouteMatchPaths.productDetailsView:
                if (isProduct(productItem)) {
                    return {type: ProductsPageSubjectType.PRODUCT, associatedData: productItem};
                } else if (isProductCategory(productItem)){
                    return {type: ProductsPageSubjectType.CATEGORY, associatedData: productItem};
                } else {break;}

            case DashboardProductsRouteMatchPaths.root:
            case MainUIProductsRouteMatchPaths.root:
                return {type: ProductsPageSubjectType.INTRO_PAGE, associatedData: null};
        }
        throw new Error("there must be a subject type at this point. CHECK LOGIC");
    })();
}







type ProductsInfoContextValue = {
    subject: ProductsPageSubject, 
    allTopLevelItems: ProductDataObject[]
}

export const ProductsInfoContext = React.createContext<Optional<ProductsInfoContextValue>>(null);


function useProductsInfoContextValue(): ProductsInfoContextValue{
    const value = React.useContext(ProductsInfoContext);
    if (!value){
        throw new Error("tried to access the projects page subject outside of the Products component. This is not allowed.");
    }
    return value;
}

export function useCurrentProductsPageSubject(): ProductsPageSubject{
    return useProductsInfoContextValue().subject;
}

export function useAllTopLevelProductItems(): ProductDataObject[]{
    return useProductsInfoContextValue().allTopLevelItems;
}

// returns null if the products page isn't currently displaying the details view for a product or category
export function useCurrentProductDetailsViewItem(): Optional<ProductDataObject>{
    const subject = useCurrentProductsPageSubject();
    if (subject.type !== ProductsPageSubjectType.CATEGORY && 
        subject.type !== ProductsPageSubjectType.PRODUCT){
            return null;
        }
    return subject.associatedData as ProductDataObject;
}


export function useToURLForProductItem(productsItem: ProductDataObject): string {
    const isDashboard = useIsDashboard();
    return isDashboard ? 
    DashboardProductsRouteURLs.productDetailsView(productsItem.id) : MainUIProductsRouteURLs.productDetailsView(productsItem.id);
}



