import React, { useEffect, useRef } from "react";
import LoadingIndicator from "../LoadingIndicator/LoadingIndicator";
import './LoadingButton.scss';


export interface LoadingButtonProps{
    className?: string,
    shouldShowIndicator: boolean,
    children?: React.ReactNode,
    loadingIndicatorSize?: string,
    onClick?: () => void,
}


export default function LoadingButton(props: LoadingButtonProps){

    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const button = buttonRef.current
        if (!button){return;}
        const computedStyle = getComputedStyle(button)
        button.style.height = computedStyle.height;
        button.style.width = computedStyle.width;
    });

    const className = props.className + " LoadingButton";

    const loadingIndicatorSize = props.loadingIndicatorSize ?? "20.8px";

    return <button ref={buttonRef} className={className} style={{
        pointerEvents: props.shouldShowIndicator ? "none" : undefined,
    }} onClick={props.onClick}>
        {props.shouldShowIndicator ? <LoadingIndicator style={{height: loadingIndicatorSize, width: loadingIndicatorSize}}/> : props.children}
    </button>
}


