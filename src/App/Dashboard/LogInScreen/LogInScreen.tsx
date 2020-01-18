
import React, { useState } from "react";
import errorIcon from "../icons/errorIcon";
import LoadingIndicator from "random-components/LoadingIndicator/LoadingIndicator";
import CustomTextField from 'random-components/CustomTextField/CustomTextField';
import './LogInScreen.scss';
import { Optional } from "jshelpers";
import { logIn } from "API";


export default function LogInScreen(props: {authTokenHandler: (authToken: string) => void}){

    const [textFieldText, setTextFieldText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<Optional<string>>(null);

    function respondToTextFieldTextChange(text: string){
        setTextFieldText(text);
    }

    function respondToLogInButtonClicked(){
        const text = textFieldText.trim();
        if (text === ""){
            setErrorMessage("You havn't entered a code yet");
            return;
        }
        logIn(textFieldText).then((result) => {
            props.authTokenHandler(result.authToken);
        }).catch((errorMessage) => {
            setErrorMessage(errorMessage);
        }).finally(() => {
            setIsLoading(false);
        });
        setErrorMessage(null);
        setIsLoading(true);
    }

    function respondToOnSubmit(formEvent: React.FormEvent<HTMLFormElement>){
        respondToLogInButtonClicked();
        formEvent.preventDefault();
    }
    
    return <form className="LogInScreen" onSubmit={respondToOnSubmit}>
        <div className="vertically-centered-content">
            <div className="horizontally-centered-content">
                <div className="title">Log In</div>
                <CustomTextField isPassword placeholderText="Enter your passcode" value={textFieldText} onTextChange={respondToTextFieldTextChange}/>
                {(() => {
                    if (errorMessage){
                        return <div className="error-message-box" >
                            {errorIcon}
                            <div className="text-box">{errorMessage}</div>
                        </div>
                    }
                })()}
                <button className="login-button" style={{
                    pointerEvents: isLoading ? "none" : undefined,
                }} onClick={respondToLogInButtonClicked}>
                    {isLoading ? <LoadingIndicator/> : "Log In"}
                </button>
            </div>
        </div>        
    </form>
}

