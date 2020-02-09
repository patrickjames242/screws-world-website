
import './ProductItemImageView.scss';
import React, {useMemo, useRef, useEffect} from 'react';
import { ProductDataObject } from 'App/MainSiteInterface/Products/ProductsDataHelpers';
import { Optional } from 'jshelpers';
import noImageAvailableIcon from './noImageAvailableIcon.js';

export default function ProductItemImageView(props: {imageSource?: File | ProductDataObject | null}){
    
    const previousObjectURL = useRef<Optional<string>>(null);

    const imageURL = useMemo(() => {
        
        if (previousObjectURL.current != null){
            URL.revokeObjectURL(previousObjectURL.current);
        }
        
        if (props.imageSource instanceof ProductDataObject){
            return props.imageSource.imageURL;
        } else if (props.imageSource instanceof File){
            const objectURL = URL.createObjectURL(props.imageSource);
            previousObjectURL.current = objectURL;
            return objectURL;
        } else {
            return null;
        }

    }, [props.imageSource]);

    useEffect(() => {
        return () => {
            if (previousObjectURL.current){
                URL.revokeObjectURL(previousObjectURL.current);
                previousObjectURL.current = null;
            }
        }
    }, []);

    return <div className="ProductItemImageView">
        <div className="image-holder">
            
            {(() => {
                if (imageURL != null){
                    return  <img src={imageURL} alt=""/>;
                } else {
                    return <NoImageAvailableView/>;
                }
            })()}
            
        </div>
    </div>
}


function NoImageAvailableView(){
    return <div className="NoImageAvailableView">
        <div className="content">
            {noImageAvailableIcon}
            <div className="text">No Image Available</div>
        </div>
    </div>
}

