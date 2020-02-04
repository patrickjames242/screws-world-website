import './ProductDetailsView.scss';

import React from 'react';
import { Product } from '../../ProductsDataHelpers';



export default function ProductDetailsView(props: { product: Product }) {
    return <div className="ProductDetailsView">
        <div className="description-section">
            {props.product.description}
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

