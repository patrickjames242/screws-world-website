
import React, { useRef } from 'react';
import './CustomTextField.scss';

export enum TextFieldType{
    SingleLine,
    MultipleLine,
}

export interface TextFieldProps{
    type?: TextFieldType;
    topText?: string;
    placeholderText: string;
    className?: string;
    initialText?: string;
    onTextChange?: (text: string) => void;
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

    const inputElement = (() => {
        let elementType, typeProp;
        switch (props.type ?? TextFieldType.SingleLine) {
            case TextFieldType.SingleLine:
                elementType = "input"; typeProp = "text";
                break;
            case TextFieldType.MultipleLine:
                elementType = "textarea";
                break;
            default: return null;
        }
        const propDict = {
            value: props.initialText,
            className: "text-input " + props.className ?? "",
            placeholder: props.placeholderText,
            onFocus: respondToOnFocus,
            onBlur: respondToOnBlur,
            type: typeProp,
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

