
import React from 'react';
import { Link } from 'react-router-dom';
import { ProductDataObject, ProductDataType, } from '../../ProductsDataHelpers';
import { useToURLForProductItem } from '../../ProductsUIHelpers';
import './ProductItemsGrid.scss';
import ProductItemImageView from 'random-components/ProductItemImageView/ProductItemImageView';


console.warn("see if you can get the text area of the product or category item to wrap its text if its shorter than the longest item in its row");
console.warn("write code on the server side that prevents a trimmed title string from being empty");

export default function ProductItemsGrid(props: { products: ProductDataObject[] }) {
    return <div className="ProductItemsGrid">
        {props.products.map(x => {
            return <ProductOrCategoryItem dataObject={x} key={x.id.stringVersion} />
        })}
    </div>
}


function ProductOrCategoryItem(props: { dataObject: ProductDataObject }) {

    const productOrCategoryText = (() => {
        switch (props.dataObject.id.objectType) {
            case ProductDataType.Product: return "product";
            case ProductDataType.ProductCategory: return "category";
        }
    })();

    const path = useToURLForProductItem(props.dataObject);

    return <Link to={path} className="ProductOrCategoryItem">
        <div className="background-view" />
        <div className="content-box">
            <div className="image-box">
                <ProductItemImageView imageSource={props.dataObject} />
                <div className="product-or-category">{productOrCategoryText}</div>
            </div>
            <div className="under-image-content">
                <div className="text-box">
                    <div className="title">{props.dataObject.name}</div>
                    {(() => {
                        if ((props.dataObject.description?.trim() ?? "") !== ""){
                            return <div className="description">{props.dataObject.description}</div>
                        }
                    })()}
                </div>
            </div>
        </div>
    </Link>
}




