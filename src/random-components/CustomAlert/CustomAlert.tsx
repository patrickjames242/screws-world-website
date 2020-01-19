
import React, { useState, useRef, useContext } from 'react';
import './CustomAlert.scss';
import { Optional } from 'jshelpers';
import {animated, useSpring} from 'react-spring';

interface AlertProviderFunctions {
    showAlert(info: CustomAlertInfo): void;
}

const AlertContext = React.createContext<Optional<AlertProviderFunctions>>(null);

export const AlertContextConsumer = AlertContext.Consumer;

export function useAlertFunctionality(): AlertProviderFunctions {
    return useContext(AlertContext)!;
}

export default function AlertProvider(props: { children: JSX.Element | JSX.Element[] | undefined | null }) {

    const [alerts, setAlerts] = useState<CustomAlertInfo[]>([]);
    document.body.style.overflow = alerts.length <= 0 ? "initial" : "hidden";
    const alertProviderFunctions = useRef<AlertProviderFunctions>({
        showAlert(info) {
            setAlerts((prevAlerts) => {
                if (prevAlerts.some(a => a === info || a.uniqueKey === info.uniqueKey)) {
                    throw new Error("tried to present an alert that is already being displayed");
                }
                prevAlerts.push(info);
                return [...prevAlerts];
            });
        },
    }).current;

    function removeAlertForAlertInfo(info: CustomAlertInfo) {
        setAlerts((prevAlerts) => {
            return [...prevAlerts.filter(a => a !== info && a.uniqueKey !== info.uniqueKey)];
        });
    }

    return <AlertContext.Provider value={alertProviderFunctions}>
        {props.children}
        {alerts.map(a => {
            return <CustomAlert key={a.uniqueKey} {...a} onAlertIsFinishedDismissing={() => removeAlertForAlertInfo(a)} />
        })}
    </AlertContext.Provider>
}


export enum CustomAlertButtonType {
    // blue button
    PRIMARY,
    // red button
    PRIMARY_DESTRUCTIVE,
    // empty background, gray text
    SECONDARY,
}


export class CustomAlertButtonInfo {
    constructor(
        readonly title: string,
        readonly action: () => void,
        readonly type: CustomAlertButtonType,
    ){}    
}

export class CustomAlertInfo {
    constructor(
        readonly uniqueKey: string,
        readonly title: string,
        readonly description: string,
        readonly showsTextField: boolean,
        readonly leftButtonInfo?: CustomAlertButtonInfo,
        readonly rightButtonInfo?: CustomAlertButtonInfo,
        readonly controller: CustomAlertController = {},
    ){}   
}

export interface CustomAlertController{
    dismiss?: () => void;
}

function CustomAlert(props: CustomAlertInfo & { onAlertIsFinishedDismissing: () => void }) {

    const [shouldBePresented, setShouldBePresented] = useState(true);
    
    const backgroundIsDismissed = useRef(false);
    const centerContentIsDismissed = useRef(false);

    function notifyThatAnimationHasFinished(){
        
        if ( backgroundIsDismissed.current === false || centerContentIsDismissed.current === false || shouldBePresented){return;}
        
        props.onAlertIsFinishedDismissing();
    
    }

    function dismissAlert() {
        setShouldBePresented(false);
    }

    function respondToBackgroundViewClicked(){
        dismissAlert();
    }

    const backgroundStyle = useSpring({
        from: {opacity: 0},
        opacity: shouldBePresented ? 1 : 0,
        onRest: () => {
            if (shouldBePresented === false){
                backgroundIsDismissed.current = true;
                notifyThatAnimationHasFinished();
            }
        },
        config: {duration: 200},
    });

    const centerContentStyle = useSpring({
        from: {opacity: 0, transform: "translateY(20rem) rotate(20deg)"},
        to: {
            opacity: shouldBePresented ? 1 : 0,
            transform: shouldBePresented ? "translateY(0px) rotate(0deg)" : "translateY(20rem) rotate(20deg)",
        },
        onRest: () => {
            if (shouldBePresented === false){
                centerContentIsDismissed.current = true;
                notifyThatAnimationHasFinished();
            }
        },
        config: {
            tension: 300,
            friction: 23,
            duration: shouldBePresented ? undefined : 150,
        },
    });

    props.controller.dismiss = dismissAlert;   
    
    return <div className="CustomAlert">
        <animated.div onClick={respondToBackgroundViewClicked} style={backgroundStyle} className="background-view"/>
        <animated.div style={centerContentStyle} className="content">
            <div className="title">{props.title}</div>
            <div className="description">{props.description}</div>
            <div className="button-box">
                {(() => {
                    return [props.leftButtonInfo, props.rightButtonInfo].map((x, i) => {
                        if (!x) { return null; }
                        return <CustomAlertButton key={i} {...x}/>
                    });
                })()}
            </div>
        </animated.div>
    </div>
}


function CustomAlertButton(props: CustomAlertButtonInfo) {

    function respondToClick(){
        props.action();
    }

    const className = "CustomAlertButton " + (() => {
        switch (props.type) {
            case CustomAlertButtonType.PRIMARY: return 'primary';
            case CustomAlertButtonType.PRIMARY_DESTRUCTIVE: return 'primary-destructive';
            case CustomAlertButtonType.SECONDARY: return 'secondary';
        }
    })();

    return <button className={className} onClick={respondToClick}>
        {props.title}
    </button>
}

