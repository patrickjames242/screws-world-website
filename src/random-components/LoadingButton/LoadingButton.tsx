import React, { useEffect, useRef } from "react";
import LoadingIndicator from "../LoadingIndicator/LoadingIndicator";
import './LoadingButton.scss';


export interface LoadingButtonProps{
    className?: string,
    shouldShowIndicator: boolean,
    children?: React.ReactNode,
    loadingIndicatorSize?: string,
    onClick?: () => void,

    // these determine whether or not the buttons set their height based on their computed height after the first render
    retainsHeight?: boolean,
    retainsWidth?: boolean,
}

export default function LoadingButton(props: LoadingButtonProps){

    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const button = buttonRef.current
        if (!button){return;}
        const computedStyle = getComputedStyle(button)
        
        if (props.retainsHeight){
            button.style.height = computedStyle.height;
        }
        
        if (props.retainsWidth){
            button.style.width = computedStyle.width;
        }

    }, [props.retainsHeight, props.retainsWidth]);

    const className = props.className + " LoadingButton";

    const loadingIndicatorSize = props.loadingIndicatorSize ?? "20.8px";

    return <button ref={buttonRef} className={className} style={{
        pointerEvents: props.shouldShowIndicator ? "none" : undefined,
    }} onClick={props.onClick}>
        {props.shouldShowIndicator ? <LoadingIndicator style={{height: loadingIndicatorSize, width: loadingIndicatorSize}}/> : props.children}
    </button>
}


