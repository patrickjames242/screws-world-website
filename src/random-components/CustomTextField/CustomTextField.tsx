
import React, { useState } from 'react';
import './CustomTextField.scss';
import { callIfPossible } from 'jshelpers';

export enum TextFieldType{
    SingleLine,
    MultipleLine,
}

export interface TextFieldProps{
    type?: TextFieldType;
    topText?: string;
    placeholderText: string;
    className?: string;
    value?: string;
    onTextChange?: (text: string) => void;
    isPassword?: boolean;
}

export default function TextField(props: TextFieldProps) {

    const [isInFocus, setIsInFocus] = useState(false);

    function respondToOnFocus() {
        setIsInFocus(true);
    }

    function respondToOnBlur() {
        setIsInFocus(false)
    }

    function handleChange(event: Event){
        callIfPossible(props.onTextChange, (event.target as any).value ?? "");
    }

    const inputElement = (() => {
        let elementType, typeProp;
        switch (props.type ?? TextFieldType.SingleLine) {
            case TextFieldType.SingleLine:
                elementType = "input"; typeProp = props.isPassword ?? false ? "password" : "text";
                break;
            case TextFieldType.MultipleLine:
                elementType = "textarea";
                break;
            default: return null;
        }
        const propDict = {
            value: props.value,
            className: "text-input " + props.className ?? "",
            placeholder: props.placeholderText,
            onFocus: respondToOnFocus,
            onBlur: respondToOnBlur,
            type: typeProp,
            onChange: handleChange,
        };
        
        return React.createElement(elementType, propDict);
    })();

    const className = [
        "CustomTextField",
        (isInFocus ? "active" : ""),  
        props.className ?? "", 
    ].join(" ");

    return <div className={className}>
        {(() => {
            if (props.topText !== undefined){
                return <div className="top-text">{props.topText}</div>;
            }
        })()}
        {inputElement}
    </div>

}

