
import React, { useRef } from 'react';
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

    const textFieldRef = useRef<HTMLDivElement>(null);

    const activeClassName = "active";

    function respondToOnFocus() {
        textFieldRef.current?.classList.add(activeClassName);
    }

    function respondToOnBlur() {
        textFieldRef.current?.classList.remove(activeClassName);
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

    return <div className="CustomTextField" ref={textFieldRef}>
        {(() => {
            if (props.topText !== undefined){
                return <div className="top-text">{props.topText}</div>;
            }
        })()}
        {inputElement}
    </div>

}

