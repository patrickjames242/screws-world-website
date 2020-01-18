import React, { CSSProperties } from 'react';
import './LoadingIndicator.scss';

export default function LoadingIndicator(props: {style?: CSSProperties}){

    return <div className="LoadingIndicator" style={props.style}>
        <svg viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
            <circle className="path" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
        </svg>
    </div>
    
    
}