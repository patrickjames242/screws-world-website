

import './ProductDetailsView.scss';

import React from 'react';
import { Product } from '../../ProductsDataHelpers';
import ProductItemImageView from 'random-components/ProductItemImageView/ProductItemImageView';



export default function ProductDetailsView(props: { product: Product }) {
    return <div className="ProductDetailsView">

        {(() => {
            if (props.product.description != null && 
                props.product.description.trim() !== "") {
                return <p className="description-section">
                    {props.product.description}
                </p>
            }
        })()}

        <div className="image-section-holder">
            <div className="image-section">
                <div className="content">
                    <div className="background-view" />
                    <ProductItemImageView imageSource={props.product.imageURL} imageContentFitMode={props.product.imageContentFitMode}/>
                </div>
            </div>
        </div>
    </div>
}

