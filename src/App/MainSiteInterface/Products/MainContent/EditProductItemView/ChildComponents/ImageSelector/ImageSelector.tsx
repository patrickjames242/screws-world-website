
import './ImageSelector.scss';
import React, { useRef } from 'react';
import CustomInput, { CustomInputChildParams, CustomInputProps } from 'random-components/CustomInputs/CustomInput';
import { OptionalDatabaseValue } from '../../EditProductItemViewHelpers';
import ProductItemImageView from 'random-components/ProductItemImageView/ProductItemImageView';
import { ProductDataObject } from 'App/MainSiteInterface/Products/ProductsDataHelpers';
import { Optional } from 'jshelpers';

import Compressor from 'compressorjs';
import { ProductImageContentFitMode } from 'API';


export interface ProductItemImageSelectorProps extends CustomInputProps<OptionalDatabaseValue<File>>{
    itemBeingEdited: Optional<ProductDataObject>,
}

export interface ProductImageSelectorImageFitModeProps{
    value: ProductImageContentFitMode,
    onChange: (newValue: ProductImageContentFitMode) => void,
}

export default function ProductItemImageSelector(props: ProductItemImageSelectorProps & {imageFitModeProps: ProductImageSelectorImageFitModeProps}) {

    const fileInputRef = useRef<HTMLInputElement>(null);

    function respondToSelectButtonClicked() {
        fileInputRef.current?.click();
    }

    function respondToFileInputValueDidChange(event: React.ChangeEvent<HTMLInputElement>){
        const newValue = event.target.files?.[0];
        if (newValue == null){return;}
        event.target.value = ''; // so that the onChange handler will be called if another image is selected
        compressImageFileIfNeeded(newValue)
        .then((compressedFile) => {            
            props.onValueChange?.(compressedFile);
        }).catch((error) => {
            console.error("something went wrong when trying to compress the image", error.message);
        });
    }

    function respondToRemoveButtonClicked() {
        props.onValueChange?.(null);
    }

    const imageViewValue = (() => {
        if (props.value === undefined){
            return props.itemBeingEdited?.imageURL ?? null;
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
                    <ProductItemImageView imageSource={imageViewValue} imageContentFitMode={props.imageFitModeProps.value}/>
                </div>;
            }}
        </CustomInput>
        
        <input ref={fileInputRef} style={{ opacity: 0, position: "absolute" }} className="file-input" type="file" accept="image/*" onChange={respondToFileInputValueDidChange}/>

        <div className="bottom-image-controls">
            <FitOrFillChooser {...props.imageFitModeProps}/>
            <EditImageButtons style={{
                opacity: (props.isEnabled ?? true) ? undefined : 0.5,
                pointerEvents: (props.isEnabled ?? true) ? undefined : "none",
            }} shouldShowRemoveButton={shouldShowRemoveButton} onRemoveButtonClick={respondToRemoveButtonClicked} onSelectImageButtonClick={respondToSelectButtonClicked} />
        </div>

    </div>

}





function FitOrFillChooser(props: {value: ProductImageContentFitMode, onChange: (newValue: ProductImageContentFitMode) => void}){

    const fillValue = 'fill';
    const fitValue = 'fit';

    function respondToOnChange(event: React.ChangeEvent<HTMLInputElement>){
        const value = event.target.value;
        const newMode = (() => {
            switch (value){
                case fillValue: return ProductImageContentFitMode.fill;
                case fitValue: return ProductImageContentFitMode.fit;
                default: throw new Error('this point should not be reached!! Check logic!!')
            }
        })()
        props.onChange(newMode);
    }

    const radioButtonName = "FIT OR FILL"
    return <div className="FitOrFillChooser">
        <RadioButtonOption 
            name={radioButtonName} 
            inputID="fitOrFill-fill-option" 
            labelText="Fill" 
            checked={props.value === ProductImageContentFitMode.fill} 
            value={fillValue} 
            onChange={respondToOnChange}/>
        <RadioButtonOption 
            name={radioButtonName} 
            inputID="fitOrFill-fit-option" 
            labelText="Fit" 
            value={fitValue}
            checked={props.value === ProductImageContentFitMode.fit} 
            onChange={respondToOnChange}/>
    </div>

}



interface RadioButtonOptionProps{ 
    
    name: string, 
    inputID: string, 
    value: string,
    labelText: string, 
    checked: boolean,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,

}


function RadioButtonOption(props: RadioButtonOptionProps) {
    return <div className="RadioButtonOption">
        <input type="radio" id={props.inputID} name={props.name} value={props.value} checked={props.checked} onChange={props.onChange}/>
        <label htmlFor={props.inputID}>{props.labelText}</label>
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





async function compressImageFileIfNeeded(file: File): Promise<File> {

    if (file.size <= 50000){
        return file;
    }

    const compressionPercentage = (() => {
        if (file.size <= 200000){
            return 0.9;
        } else if (file.size <= 1000000){
            return 0.5;
        } else {
            return 0.08;
        }
    })();

    return await new Promise((resolve, reject) => {
        new Compressor(file, {
            quality: compressionPercentage,
            success(blob: Blob){
                resolve(new File([blob], file.name, {type: blob.type}));
            },
            error(error: Error){
                reject(error);
            },
        });
    });
}


