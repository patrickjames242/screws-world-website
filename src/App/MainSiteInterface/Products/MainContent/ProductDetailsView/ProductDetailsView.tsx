import './ProductDetailsView.scss';

import React from 'react';
import { Product } from '../../ProductsDataHelpers';



export default function ProductDetailsView(props: { product: Product }) {
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

