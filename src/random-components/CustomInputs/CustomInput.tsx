
import React, { useState } from 'react';
import './CustomInput.scss';


export interface CustomInputProps {
    topText?: string;
    className?: string;    
}

export type CustomInputChild = (props: {className: string, onFocus: () => void, onBlur: () => void}) => React.ReactElement;

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

    const child = props.children({className: "input-box", onFocus: respondToOnFocus, onBlur: respondToOnBlur});

    return <div className={className}>
        {(() => {
            if (props.topText !== undefined) {
                return <div className="top-text">{props.topText}</div>;
            }
        })()}
        {child}
    </div>
}
