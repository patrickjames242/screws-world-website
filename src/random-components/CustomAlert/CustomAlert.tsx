
import React, { useState, useRef, useContext, useEffect } from 'react';
import './CustomAlert.scss';
import { Optional, Notification } from 'jshelpers';
import { animated, useSpring } from 'react-spring';
import CustomTextField from '../CustomInputs/CustomTextField/CustomTextField';

import LoadingButton from 'random-components/LoadingButton/LoadingButton';
import ErrorMessageBox from 'random-components/ErrorMessageBox/ErrorMessageBox';

export interface AlertProviderFunctions {
    showAlert(info: CustomAlertInfo): void;
}


const AlertContext = React.createContext<Optional<AlertProviderFunctions>>(null);

export const AlertContextConsumer = AlertContext.Consumer;

export function useAlertFunctionality(): AlertProviderFunctions {
    return useContext(AlertContext)!;
}

export default function AlertProvider(props: { children: React.ReactNode}) {

    const [alerts, setAlerts] = useState<CustomAlertInfo[]>([]);
    document.body.style.overflow = alerts.length <= 0 ? "initial" : "hidden";

    function isEqual(i1: CustomAlertInfo, i2: CustomAlertInfo): boolean{
        return i1.uniqueKey === i2.uniqueKey || i1 === i2;
    }

    const alertProviderFunctions = useRef<AlertProviderFunctions>({
        showAlert(info) {
            setAlerts((prevAlerts) => {
                if (prevAlerts.some(a => isEqual(a, info))) {
                    prevAlerts.forEach((x, i) => {
                        if (isEqual(x, info) === false){return;}
                        if (x.shouldReplaceInfo?.(info) === true){
                            prevAlerts[i] = info;
                            return [...prevAlerts];
                        } else {
                            throw new Error("tried to present an alert that is already being displayed");
                        }
                    });
                } else {
                    prevAlerts.push(info);
                }
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

export interface CustomAlertTextFieldController {
    currentTextFieldText: string,
    readonly textDidChangeNotification: Notification<string>;
}

export class CustomAlertTextFieldInfo {
    constructor(
        readonly placeholderText?: string,
        readonly onMount?: (controller: CustomAlertTextFieldController) => void,
    ) { }
}

export class CustomAlertInfo {
    constructor(
        readonly uniqueKey: string,
        readonly title: string,
        readonly description: string,
        readonly textFieldInfo?: CustomAlertTextFieldInfo,
        readonly leftButtonInfo?: CustomAlertButtonInfo,
        readonly rightButtonInfo?: CustomAlertButtonInfo,
        readonly onMount?: (controller: CustomAlertController) => void,
        readonly onDismiss?: () => void,
        readonly shouldReplaceInfo?: (newInfo: CustomAlertInfo) => boolean,
    ) { }
}

export interface CustomAlertController {
    dismiss: () => void;
    showErrorMessage: (message: Optional<string>) => void;
}



function CustomAlert(props: CustomAlertInfo & { onAlertIsFinishedDismissing: () => void }) {

    const [shouldBePresented, setShouldBePresented] = useState(true);
    const [textFieldText, setTextFieldText] = useState("");
    const [errorMessage, setErrorMessage] = useState<Optional<string>>(null);

    const backgroundIsDismissed = useRef(false);
    const centerContentIsDismissed = useRef(false);

    function notifyThatAnimationHasFinished() {
        if (backgroundIsDismissed.current === false || centerContentIsDismissed.current === false || shouldBePresented) { return; }
        props.onAlertIsFinishedDismissing();
    }

    function dismissAlert() {
        setShouldBePresented(false);
        props.onDismiss?.();
    }

    const backgroundStyle = useSpring({
        from: { opacity: 0 },
        opacity: shouldBePresented ? 1 : 0,
        onRest: () => {
            if (shouldBePresented === false) {
                backgroundIsDismissed.current = true;
                notifyThatAnimationHasFinished();
            }
        },
        config: { duration: 200 },
    });

    const centerContentStyle = useSpring({
        from: { opacity: 0, transform: "translateY(20rem) rotate(20deg)" },
        to: {
            opacity: shouldBePresented ? 1 : 0,
            transform: shouldBePresented ? "translateY(0px) rotate(0deg)" : "translateY(20rem) rotate(20deg)",
        },
        onRest: () => {
            if (shouldBePresented === false) {
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

    const alertController = useRef<CustomAlertController>({
        dismiss: dismissAlert,
        showErrorMessage: setErrorMessage,
    }).current;


    const textFieldController = useRef<CustomAlertTextFieldController>({
        currentTextFieldText: textFieldText,
        textDidChangeNotification: new Notification<string>(),
    }).current;

    useEffect(() => {
        props.onMount?.(alertController);
        props.textFieldInfo?.onMount?.(textFieldController);
    }, [alertController, props.onMount, props.textFieldInfo, textFieldController]);

    function respondToTextFieldTextDidChange(newText: string) {
        setTextFieldText(newText);
        textFieldController.currentTextFieldText = newText;
        textFieldController.textDidChangeNotification.post(newText);
    }


    return <div className="CustomAlert">
        <animated.div onClick={dismissAlert} style={backgroundStyle} className="background-view" />
        <animated.div style={centerContentStyle} className="vertically-centered-box">
            <div className="horizontally-centered-box">
                <div className="title">{props.title}</div>
                <div className="description">{props.description}</div>

                {(() => {
                    if (!props.textFieldInfo) { return null; }
                    return <CustomTextField
                        value={textFieldText}
                        onTextChange={respondToTextFieldTextDidChange}
                        placeholderText={props.textFieldInfo?.placeholderText ?? "Type here..."} />
                })()}

                {(() => {
                    const _errorMessage = (errorMessage ?? "").trim();
                    if (_errorMessage === "") { return null; }
                    return <ErrorMessageBox errorMessage={_errorMessage}/>
                })()}

                <div className="button-box">
                    {(() => {
                        return [props.leftButtonInfo, props.rightButtonInfo]
                            .map((x, i) => {
                                if (!x) { return null; }
                                return <CustomAlertButton key={i} {...x} dismissAlertAction={dismissAlert} />
                            });
                    })()}
                </div>
            </div>
        </animated.div>
    </div>
}


export enum CustomAlertButtonType {
    // blue button
    PRIMARY,
    // red button
    PRIMARY_DESTRUCTIVE,
    // empty background, gray text
    SECONDARY,
}

export interface CustomAlertButtonController {
    setIsLoading(isLoading: boolean): void;
    setIsActive(isActive: boolean): void;
}

export class CustomAlertButtonInfo {
    constructor(
        readonly title: string,
        readonly action: (dismissAlert: () => void) => void,
        readonly type: CustomAlertButtonType,
        readonly onMount?: (controller: CustomAlertButtonController) => void,
    ) { }
}


function CustomAlertButton(props: CustomAlertButtonInfo & {dismissAlertAction: () => void}) {

    const [isLoading, setIsLoading] = useState(false);
    const [isActive, setIsActive] = useState(true);

    const controller = useRef<CustomAlertButtonController>({
        setIsActive: setIsActive,
        setIsLoading: setIsLoading,
    }).current;

    function respondToClick() {
        props.action(props.dismissAlertAction);
    }

    const className = [
        "CustomAlertButton",
        (() => {
            switch (props.type) {
                case CustomAlertButtonType.PRIMARY: return 'primary';
                case CustomAlertButtonType.PRIMARY_DESTRUCTIVE: return 'primary-destructive';
                case CustomAlertButtonType.SECONDARY: return 'secondary';
            }
        })(),
    ].join(" ");
       
    useEffect(() => {
        props.onMount?.(controller);
    }, [controller, props.onMount]);

    return <LoadingButton isActive={isActive} loadingIndicatorSize="18px" shouldShowIndicator={isLoading} className={className} onClick={respondToClick}>
        {props.title}
    </LoadingButton>
}

