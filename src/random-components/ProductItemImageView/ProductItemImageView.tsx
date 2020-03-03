
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
            <div className="svg-icon-holder">
                {/* I'm wrapping this svg within a div because if it isn't, the layout looks all messed up in Edge for windows */}
                {noImageAvailableIcon}
            </div>
            
            <div className="text">No Image Available</div>
        </div>
    </div>
}

