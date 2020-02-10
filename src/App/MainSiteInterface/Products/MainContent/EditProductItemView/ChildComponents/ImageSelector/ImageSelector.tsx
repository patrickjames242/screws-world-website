import './ImageSelector.scss';
import React, { useRef } from 'react';
import CustomInput, { CustomInputChildParams } from 'random-components/CustomInputs/CustomInput';
import { FieldTitles, OptionalDatabaseValue } from '../../EditProductItemViewHelpers';
import ProductItemImageView from 'random-components/ProductItemImageView/ProductItemImageView';
import { ProductDataObject } from 'App/MainSiteInterface/Products/ProductsDataHelpers';
import { Optional } from 'jshelpers';


console.warn("remember that the image selector is not disabled properly while the edit product page is loading");

export default function ProductItemImageSelector(props: { itemBeingEdited: Optional<ProductDataObject>, value: OptionalDatabaseValue<File>, onValueChange: (newValue: OptionalDatabaseValue<File>) => void}) {

    const fileInputRef = useRef<HTMLInputElement>(null);

    function respondToSelectButtonClicked() {
        fileInputRef.current?.click();
    }

    function respondToFileInputValueDidChange(event: React.ChangeEvent<HTMLInputElement>){
        const newValue = event.target.files?.[0];
        if (newValue == null){return;}
        event.target.value = ''; // so that the onChange handler will be called if another image is selected
        props.onValueChange(newValue);
    }

    function respondToRemoveButtonClicked() {
        props.onValueChange(null);
    }

    const imageViewValue = (() => {
        if (props.value === undefined){
            return props.itemBeingEdited;
        } else {
            return props.value;
        }
    })();

    
    const shouldShowRemoveButton = (() => {
        if (props.value === undefined){
            return (props.itemBeingEdited?.imageURL ?? null) !== null;
        } else {
            return props.value !== null;
        }
    })();

    return <div className="ProductItemImageSelector">
        <CustomInput topText={FieldTitles.image}>
            {(params: CustomInputChildParams) => {
                return <div className={params.className} style={params.style} onFocus={params.onFocus} onBlur={params.onBlur}>
                    <ProductItemImageView imageSource={imageViewValue} />
                </div>;
            }}
        </CustomInput>

        <input ref={fileInputRef} style={{ opacity: 0, position: "absolute" }} className="file-input" type="file" accept="image/*" onChange={respondToFileInputValueDidChange}/>
        
        <EditImageButtons shouldShowRemoveButton={shouldShowRemoveButton} onRemoveButtonClick={respondToRemoveButtonClicked} onSelectImageButtonClick={respondToSelectButtonClicked} />

    </div>

}



function EditImageButtons(props: {
    shouldShowRemoveButton: boolean,
    onSelectImageButtonClick: () => void,
    onRemoveButtonClick: () => void
}) {

    function respondToSelectImageButtonClicked(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        props.onSelectImageButtonClick();
    }

    function respondToRemoveButtonClicked(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        props.onRemoveButtonClick();
    }

    return <div className="EditImageButtons">
        <button className="select-image-button" onClick={respondToSelectImageButtonClicked}>Select Image</button>
        {(() => {
            if (props.shouldShowRemoveButton){
                return <button className="remove-button" onClick={respondToRemoveButtonClicked}>Remove</button>;
            }
        })()}
        
    </div>
}

