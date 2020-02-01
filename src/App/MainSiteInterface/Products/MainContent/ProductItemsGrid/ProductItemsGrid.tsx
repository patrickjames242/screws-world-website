
import React from 'react';
import { Link } from 'react-router-dom';
import { ProductDataObject, ProductDataType, } from '../../ProductsDataHelpers';
import { useToURLForProductItem } from '../../ProductsUIHelpers';
import './ProductItemsGrid.scss';



export default function ProductItemsGrid(props: { products: ProductDataObject[] }) {
    return <div className="ProductItemsGrid">
        {props.products.map(x => {
            return <ProductOrCategoryItem dataObject={x} key={x.uniqueProductItemID} />
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




