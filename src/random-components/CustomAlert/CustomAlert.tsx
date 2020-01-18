
import React from 'react';
import './CustomAlert.scss';

export enum CustomAlertButtonType{
    // blue button
    PRIMARY,
    // red button
    PRIMARY_DESTRUCTIVE,
    // empty background, gray text
    SECONDARY,
}

export interface CustomAlertButtonInfo{
    title: string,
    action: (button: CustomAlertButtonInfo) => void,
    type: CustomAlertButtonType,
}

export interface CustomAlertProps{
    title: string,
    description: string,
    showsTextField: boolean,
    leftButtonInfo?: CustomAlertButtonInfo,
    rightButtonInfo?: CustomAlertButtonInfo,
}

export default function CustomAlert(){
    return <div className="CustomAlert">
        
    </div>
}


function CustomAlertButton(props: {info: CustomAlertButtonInfo}){
    
    return <div className="CustomAlertButton">

    </div>
}


