
import React, { useState, CSSProperties } from 'react';
import './CustomInput.scss';


export interface CustomInputProps {
    topText?: string;
    className?: string;  
    isRequired?: boolean;  
    isEnabled?: boolean
}

export type CustomInputChild = (props: {className: string, style: React.CSSProperties, onFocus: () => void, onBlur: () => void}) => React.ReactElement;

export default function CustomInput(props: CustomInputProps & {children: CustomInputChild}) {

    const [isInFocus, setIsInFocus] = useState(false);
    
    const className = [
        "CustomInput",
        props.className ?? "",
        (isInFocus ? "active" : ""),
    ].join(" ");

    function respondToOnFocus() {
        setIsInFocus(true);
    }

    function respondToOnBlur() {
        setIsInFocus(false)
    }

    const childStyle: CSSProperties = {
        opacity: (props.isEnabled ?? true) ? undefined : 0.5,
        pointerEvents: (props.isEnabled ?? true) ? undefined : "none",
    }

    const child = props.children({className: "input-box", onFocus: respondToOnFocus, onBlur: respondToOnBlur, style: childStyle});

    return <div className={className}>
        {(() => {
            if (props.topText !== undefined) {
                return <div className="top-text">{props.topText}</div>;
            }
        })()}
        {child}
    </div>
}
