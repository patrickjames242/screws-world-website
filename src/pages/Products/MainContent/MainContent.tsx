
import React from 'react';
import { Link } from 'react-router-dom';
import {Optional} from 'jshelpers';
import { ProductDataObject, ProductCategory, ProductDataType, isProductCategory } from '../ProductsDataHelpers';
import { useCurrentlySelectedItem, getToURLForProductsItem, useAllProductItems } from '../ProductsUIHelpers';
import screwImage from '../icons/screwProductImage.png';

export default function MainContent() {
    
    const currentDataTree = useAllProductItems();
    const currentlySelectedItem = useCurrentlySelectedItem();
    
    const shouldDisplayProductsIntro = currentlySelectedItem == null;

    const products = (shouldDisplayProductsIntro ? currentDataTree : (currentlySelectedItem as ProductCategory)?.children) ?? []

    const title = (() => {
        if (shouldDisplayProductsIntro){
            return "Browse Our Products";
        } else if (currentlySelectedItem != null){
            return getCompleteTitleForProductItem(currentlySelectedItem);
        } else {
            return "NO TITLE PROVIDED";
        }
    })();

    const description = (() => {
        if (shouldDisplayProductsIntro){
            return "Here you can browse a catalogue of our top selling products to see exactly what we have to offer.";
        } else if (isProductCategory(currentlySelectedItem)){
            return currentlySelectedItem.description;
        } else {
            return null;
        }
    })();

    return <div className="MainContent">
        <TitleBox title={title} description={description}/>
        <ProductItemsGrid products={products}/>
    </div>
}

function getCompleteTitleForProductItem(productItem: ProductDataObject): string{
    let names = [productItem.name];
    if (productItem.parent != null){
        names.push(getCompleteTitleForProductItem(productItem.parent));
    }
    return names.reverse().join(", ");
}


function TitleBox(props: {title: string, description: Optional<string>}) {
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


function ProductItemsGrid(props: {products: ProductDataObject[]}) {

    return <div className="ProductItemsGrid">
        {props.products.map(x => {
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
                    <div className="image-holder">
                        <img src={screwImage} alt=""/>
                    </div>
                    
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

