
import React from 'react';
import { Optional } from 'jshelpers';
import { ProductDataObject, ProductCategory, Product, isProductCategory } from '../ProductsDataHelpers';
import { useAllTopLevelProductItems, ProductsPageSubjectType, useProductsInfoContextValue } from '../ProductsUIHelpers';
import './MainContent.scss';
import ProductDetailsView from './ProductDetailsView/ProductDetailsView';
import ProductItemsGrid from './ProductItemsGrid/ProductItemsGrid';
import EditProductItemView from './EditProductItemView/EditProductItemView';
import { useIsDashboard } from 'App/Dashboard/DashboardUIHelpers';



export default function MainContent() {

    const allTopLevelProductItems = useAllTopLevelProductItems();
    const productInfo = useProductsInfoContextValue();

    const isDashboard = useIsDashboard();

    const { title, description }: { title: string, description: Optional<string> } = (() => {

        if (productInfo.loadingIsFinished === false) {
            return {
                title: "Loading...",
                description: null,
            }
        } else if (productInfo.data) {
            const currentSubject = productInfo.data.subject;

            switch (currentSubject.type) {
                case ProductsPageSubjectType.INTRO_PAGE:
                    return {
                        title: isDashboard ? "Welcome to the Products Dashboard" : "Browse Our Products",
                        description: isDashboard ?
                            "Here you can create, edit, and delete products displayed on the Screws World products page." :
                            "Here you can browse a catalogue of our top selling products to see exactly what we have to offer.",
                    };
                case ProductsPageSubjectType.CATEGORY:
                case ProductsPageSubjectType.PRODUCT:
                    let item = currentSubject.associatedData as ProductDataObject;
                    return {
                        title: getCompleteTitleForProductItem(item),
                        description: isProductCategory(item) ? item.description : null,
                    };
                case ProductsPageSubjectType.CREATE_NEW:
                    return {
                        title: "Create a new item",
                        description: null,
                    };
                case ProductsPageSubjectType.EDIT_ITEM:
                    const itemName = (currentSubject.associatedData as ProductDataObject).name;
                    return {
                        title: "Edit '" + itemName + "'",
                        description: null,
                    };
                case ProductsPageSubjectType.ERROR:
                    return {
                        title: "ERROR",
                        description: null,
                    }
            }
        } else if (productInfo.error){
            return {
                title: "ERROR",
                description: productInfo.error.message,
            }
        } else {
            throw new Error("this point should never be reached! Check logic!");
        }

        
    })();


    return <div className="MainContent">
        <TitleBox title={title} description={description} />
        {(() => {
            if (!productInfo.data) {
                return null;
            }

            const currentSubject = productInfo.data.subject;

            switch (currentSubject.type) {
                case ProductsPageSubjectType.INTRO_PAGE:
                    return <ProductItemsGrid products={allTopLevelProductItems} />
                case ProductsPageSubjectType.PRODUCT:
                    return <ProductDetailsView product={currentSubject.associatedData as Product} />
                case ProductsPageSubjectType.CATEGORY:
                    const products = (currentSubject.associatedData as ProductCategory).children;
                    return <ProductItemsGrid products={products} />
                case ProductsPageSubjectType.EDIT_ITEM:
                case ProductsPageSubjectType.CREATE_NEW:
                    let item = currentSubject.associatedData as Optional<ProductDataObject>;
                    return <EditProductItemView itemToEdit={item} />;
            }
        })()}
    </div>
}


function getCompleteTitleForProductItem(productItem: ProductDataObject): string {
    let names = [productItem.name];
    if (productItem.parent != null) {
        names.push(getCompleteTitleForProductItem(productItem.parent));
    }
    return names.reverse().join(", ");
}


function TitleBox(props: { title: string, description: Optional<string> }) {
    return <div className="TitleBox">
        <div className="text-box">
            <div className="title">{props.title}</div>
            {props.description != null ?
                <div className="description">{props.description}</div>
                : null}
        </div>
        <div className="bottom-line" />
    </div>
}





