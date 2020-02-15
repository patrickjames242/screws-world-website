
import './ImageSelector.scss';
import React, { useRef, CSSProperties } from 'react';
import CustomInput, { CustomInputChildParams, CustomInputProps } from 'random-components/CustomInputs/CustomInput';
import { OptionalDatabaseValue } from '../../EditProductItemViewHelpers';
import ProductItemImageView from 'random-components/ProductItemImageView/ProductItemImageView';
import { ProductDataObject } from 'App/MainSiteInterface/Products/ProductsDataHelpers';
import { Optional } from 'jshelpers';



export interface ProductItemImageSelectorProps extends CustomInputProps<OptionalDatabaseValue<File>>{
    itemBeingEdited: Optional<ProductDataObject>,
}

export default function ProductItemImageSelector(props: ProductItemImageSelectorProps) {

    const fileInputRef = useRef<HTMLInputElement>(null);

    function respondToSelectButtonClicked() {
        fileInputRef.current?.click();
    }

    function respondToFileInputValueDidChange(event: React.ChangeEvent<HTMLInputElement>){
        const newValue = event.target.files?.[0];
        if (newValue == null){return;}
        event.target.value = ''; // so that the onChange handler will be called if another image is selected
        props.onValueChange?.(newValue);
    }

    function respondToRemoveButtonClicked() {
        props.onValueChange?.(null);
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
    
    
    return <div className={["ProductItemImageSelector", props.className ?? ""].join(" ")}>
        
        <CustomInput {...props} className="">
            {(params: CustomInputChildParams) => {
                return <div className={params.className} style={params.style} onFocus={params.onFocus} onBlur={params.onBlur}>
                    <ProductItemImageView imageSource={imageViewValue} />
                </div>;
            }}
        </CustomInput>
        
        <input ref={fileInputRef} style={{ opacity: 0, position: "absolute" }} className="file-input" type="file" accept="image/*" onChange={respondToFileInputValueDidChange}/>

        <EditImageButtons style={{
            opacity: (props.isEnabled ?? true) ? undefined : 0.5,
            pointerEvents: (props.isEnabled ?? true) ? undefined : "none",
        }} shouldShowRemoveButton={shouldShowRemoveButton} onRemoveButtonClick={respondToRemoveButtonClicked} onSelectImageButtonClick={respondToSelectButtonClicked} />

    </div>

}



function EditImageButtons(props: {
    shouldShowRemoveButton: boolean,
    onSelectImageButtonClick: () => void,
    onRemoveButtonClick: () => void,
    style?: React.CSSProperties,
    isEnabled?: boolean,
}) {

    function respondToSelectImageButtonClicked(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        props.onSelectImageButtonClick();
    }

    function respondToRemoveButtonClicked(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        props.onRemoveButtonClick();
    }

    const shouldButtonsBeDisabled = (props.isEnabled ?? true) === false;
    
    return <div style={props.style} className="EditImageButtons">
        <button disabled={shouldButtonsBeDisabled} className="select-image-button" onClick={respondToSelectImageButtonClicked}>Select Image</button>
        {(() => {
            if (props.shouldShowRemoveButton){
                return <button disabled={shouldButtonsBeDisabled} className="remove-button" onClick={respondToRemoveButtonClicked}>Remove</button>;
            }
        })()}
    </div>
}

