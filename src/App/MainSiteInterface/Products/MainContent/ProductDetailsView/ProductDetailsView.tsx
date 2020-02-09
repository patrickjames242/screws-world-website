

import './ProductDetailsView.scss';

import React from 'react';
import { Product } from '../../ProductsDataHelpers';
import ProductItemImageView from 'random-components/ProductItemImageView/ProductItemImageView';



export default function ProductDetailsView(props: { product: Product }) {
    return <div className="ProductDetailsView">
        <div className="description-section">
            {props.product.description}
        </div>
        <div className="image-section-holder">
            <div className="image-section">
                <div className="content">
                    <div className="background-view" />
                    <ProductItemImageView imageSource={props.product}/>
                </div>
            </div>
        </div>
    </div>
}

