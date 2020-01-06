
import React from 'react';


import { ProductDataObject, ProductCategory, ProductDataType, useAllProductItems } from '../ProductsData';
import { Link } from 'react-router-dom';

import { useCurrentlySelectedItem, getToURLForProductsItem } from '../ProductsData';


export default function MainContent() {

    return <div className="MainContent">
        <TitleBox />
        <ProductItemsGrid />
    </div>
}

function TitleBox() {

    const currentlySelectedItem = useCurrentlySelectedItem();

    const shouldDisplayProductsIntro = currentlySelectedItem == null;

    const [title, description] = (() => {
        const title = shouldDisplayProductsIntro ? "Browse Our Products" : (currentlySelectedItem?.name ?? "NO TITLE PROVIDED");

        const description = shouldDisplayProductsIntro ? "Here you can browse a catalogue of our top selling products to see exactly what we have to offer." : (currentlySelectedItem?.description ?? "NO DESCRIPTION PROVIDED");

        return [title, description];
    })();

    return <div className="TitleBox">
        <div className="text-box">
            <div className="title">{title}</div>
            <div className="description">{description}</div>
        </div>
        <div className="bottom-line" />
    </div>

}


function ProductItemsGrid() {

    const currentDataTree = useAllProductItems();
    const currentlySelectedItem = useCurrentlySelectedItem();

    const shouldDisplayProductsIntro = currentlySelectedItem == null;

    const products = (shouldDisplayProductsIntro ? currentDataTree : (currentlySelectedItem as ProductCategory)?.children) ?? []

    return <div className="ProductItemsGrid">
        {products.map(x => {
            return <ProductOrCategoryItem dataObject={x} key={x.id} />
        })}
    </div>
}


function ProductOrCategoryItem(props: { dataObject: ProductDataObject }) {

    const productOrCategoryText = (() => {
        switch (props.dataObject.dataType) {
            case ProductDataType.Product: return "product";
            case ProductDataType.ProductCategory: return "category";
        }
    })();

    const path = getToURLForProductsItem(props.dataObject);

    return <Link to={path} className="ProductOrCategoryItem">
        <div className="background-view" />
        <div className="content-box">
            <div className="image-box">
                <div className="content">
                    <div className="product-or-category">{productOrCategoryText}</div>
                </div>
            </div>
            <div className="under-image-content">
                <div className="text-box">
                    <div className="title">{props.dataObject.name}</div>
                    <div className="description">{props.dataObject.description}</div>
                </div>
            </div>

        </div>
    </Link>
}

