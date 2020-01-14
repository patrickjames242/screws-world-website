
import React from 'react';
import { Link } from 'react-router-dom';
import { Optional } from 'jshelpers';
import { ProductDataObject, ProductCategory, ProductDataType, isProductCategory, Product, isProduct } from '../ProductsDataHelpers';
import { useCurrentlySelectedItem, useToURLForProductItem, useAllProductItems } from '../ProductsUIHelpers';
import './MainContent.scss';
import { useIsDashboard } from 'App/AppUIHelpers';


export default function MainContent() {

    const currentDataTree = useAllProductItems();
    const currentlySelectedItem = useCurrentlySelectedItem();

    const shouldDisplayProductsIntro = currentlySelectedItem == null;
    
    const products = (shouldDisplayProductsIntro ? currentDataTree : (currentlySelectedItem as ProductCategory)?.children) ?? []
    const isDashboard = useIsDashboard();

    const title = (() => {
        if (shouldDisplayProductsIntro) {
            if (isDashboard){
                return "Welcome to the Products Dashboard";
            } else {
                return "Browse Our Products";
            } 
            
        } else if (currentlySelectedItem != null) {
            return getCompleteTitleForProductItem(currentlySelectedItem);
        } else {
            return "NO TITLE PROVIDED";
        }
    })();

    const description = (() => {
        if (shouldDisplayProductsIntro) {
            if (isDashboard){
                return "Here you can create, edit, and delete products displayed on the Screws World products page."
            } else {
                return "Here you can browse a catalogue of our top selling products to see exactly what we have to offer.";
            }
            
        } else if (isProductCategory(currentlySelectedItem)) {
            return currentlySelectedItem.description;
        } else {
            return null;
        }
    })();

    return <div className="MainContent">
        <TitleBox title={title} description={description} />
        {(() => {
            if (isProduct(currentlySelectedItem)) {
                return <ProductDetailsView product={currentlySelectedItem} />
            } else {
                return <ProductItemsGrid products={products} />
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


function ProductItemsGrid(props: { products: ProductDataObject[] }) {
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

    const path = useToURLForProductItem(props.dataObject);

    return <Link to={path} className="ProductOrCategoryItem">
        <div className="background-view" />
        <div className="content-box">
            <div className="image-box">
                <div className="content">
                    <img src={props.dataObject.imageURL} alt="" />
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


function ProductDetailsView(props: { product: Product }) {
    return <div className="ProductDetailsView">
        <div className="description-section">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Voluptates temporibus, earum voluptas minus facere error quam saepe similique doloremque est suscipit perferendis facilis eius, assumenda repellat ab, praesentium qui itaque?
        <br /><br />
            Aliquid suscipit quidem deleniti adipisci a officia excepturi dicta culpa aspernatur, perferendis sint ipsam molestias soluta provident totam omnis animi magni recusandae numquam laudantium ducimus possimus aperiam ab nisi.
        </div>
        <div className="image-section-holder">
            <div className="image-section">
                <div className="content">
                    <div className="background-view" />
                    <div className="image-holder">
                        <img src={props.product.imageURL} alt="" />
                    </div>
                </div>
            </div>
        </div>
    </div>
}

