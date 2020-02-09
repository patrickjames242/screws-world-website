

import React from 'react';
import './CustomSelect.scss';
import CustomInput, { CustomInputProps } from '../CustomInput';

export interface CustomSelectChild {
    readonly stringValue: string,
    readonly uniqueID: string,
}


export interface CustomSelectProps extends CustomInputProps{
    
    readonly placeholderText?: string,
    readonly children: CustomSelectChild[],

    // string should represent the unique id of the select child
    readonly value?: string,
    readonly onValueChange?: (newValueUniqueID: string) => void,
}


export default function CustomSelect(props: CustomSelectProps) {

    function respondToValueChange(event: React.ChangeEvent<HTMLSelectElement>){
        props.onValueChange?.(event.target.value);
    };

    const className = [
        "CustomSelect",
        props.className ?? "",
    ].join(" ");

    const placeholderText = props.placeholderText ?? "Please select an option";
    const componentProps = props;

    return <CustomInput className={className} isEnabled={props.isEnabled} topText={componentProps.topText}>
        {(props) => {
            return <select
                value={componentProps.value}
                required
                className={props.className}
                onFocus={props.onFocus}
                onBlur={props.onBlur}
                style={props.style}
                onChange={respondToValueChange}>
                <option disabled value="">{placeholderText}</option>
                {/* providing a default value because apparently typescript isn't forcing callers to provide the children array as a child of this component 🤷🏽‍♂️ */}
                {(componentProps.children ?? []).map(x => {
                    return <option key={x.uniqueID} value={x.uniqueID}>
                        {x.stringValue}
                    </option>
                })}
            </select>
        }}
    </CustomInput>
}

