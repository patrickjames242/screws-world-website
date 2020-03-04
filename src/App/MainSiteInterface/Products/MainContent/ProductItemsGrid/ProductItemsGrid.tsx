
import React from 'react';
import { Link } from 'react-router-dom';
import { ProductDataObject, ProductDataType, } from '../../ProductsDataHelpers';
import { useToURLForProductItem } from '../../ProductsUIHelpers';
import './ProductItemsGrid.scss';
import ProductItemImageView from 'random-components/ProductItemImageView/ProductItemImageView';




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

    // because the gradient doesn't work properly for text here in edge for windows (non chromium version)
    const path = useToURLForProductItem(props.dataObject);

    const isEdgeBrowser = /Edge/.test(navigator.userAgent);

    return <Link to={path} className="ProductOrCategoryItem">
        <div className="background-view" />
        <div className="content-box">
            <div className="image-box">
                <ProductItemImageView imageSource={props.dataObject} />
                <div className="product-or-category">{productOrCategoryText}</div>
            </div>
            <div className="under-image-content">
                <div className="text-box">
                    <h4 className="title" style={{
                        WebkitTextFillColor: isEdgeBrowser ? "initial" : undefined,
                    }}>{props.dataObject.name}</h4>
                    {(() => {
                        if ((props.dataObject.description?.trim() ?? "") !== ""){
                            return <p className="description">{props.dataObject.description}</p>
                        }
                    })()}
                </div>
            </div>
        </div>
    </Link>
}




