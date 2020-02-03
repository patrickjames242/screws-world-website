import React from 'react';
import './CustomTextField.scss';
import { callIfPossible } from 'jshelpers';
import CustomInput, { CustomInputProps } from '../CustomInput';



export enum CustomTextFieldType {
    SingleLine,
    MultipleLine,
}

export interface CustomTextFieldProps extends CustomInputProps {
    type?: CustomTextFieldType;
    placeholderText: string;
    value?: string;
    onTextChange?: (text: string) => void;
    isPassword?: boolean;
}

export default function CustomTextField(props: CustomTextFieldProps) {
    function handleChange(event: Event) {
        callIfPossible(props.onTextChange, (event.target as any).value ?? "");
    }

    const inputElement = 
    (inputProps: {className: string, onFocus: () => void, onBlur: () => void}) => {
        let elementType, typeProp;

        switch (props.type) {    
            case CustomTextFieldType.MultipleLine:
                elementType = "textarea";
                break;
            default: 
            elementType = "input"; 
                typeProp = (props.isPassword ?? false) ? "password" : "text";
                break;
        }

        const propDict = {
            value: props.value,
            className: inputProps.className,
            placeholder: props.placeholderText,
            onFocus: inputProps.onFocus,
            onBlur: inputProps.onBlur,
            type: typeProp,
            onChange: handleChange,
        };

        return React.createElement(elementType, propDict);
    };

    const className = [
        "CustomTextField",
        props.className ?? "",
    ].join(" ");

    return <CustomInput topText={props.topText} className={className}>
        {inputElement}
    </CustomInput>

}