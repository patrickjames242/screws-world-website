
import React, { useState, useRef, useEffect } from "react";
import CustomTextField from 'random-components/CustomInputs/CustomTextField/CustomTextField';
import './LogInScreen.scss';
import { Optional } from "jshelpers";
import { logIn } from "API";
import LoadingButton from "random-components/LoadingButton/LoadingButton";
import ErrorMessageBox from "random-components/ErrorMessageBox/ErrorMessageBox";

export default function LogInScreen(props: { authTokenHandler: (authToken: string) => void }) {

    const [passwordText, setPasswordText] = useState("");
    const [usernameText, setUsernameText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<Optional<string>>(null);

    function respondToOnSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
        formEvent.preventDefault();
        if (passwordText === "" || usernameText === "") {
            setErrorMessage("You must enter both a username and a password to log in.");
            return;
        }
        
        logIn(usernameText, passwordText).finally(() => {
            setIsLoading(false);
        }).then((result) => {
            props.authTokenHandler(result.authToken);
        }).catch((error) => {
            setErrorMessage(error.message);
        });
        setErrorMessage(null);
        setIsLoading(true);
    }

    const loginScreenRef = useRef<HTMLFormElement>(null);
    const verticallyCenteredContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        
        function setLoginScreenMinWidth(){
            
            if (loginScreenRef.current == null || 
                verticallyCenteredContentRef.current == null){
                return;
            }

            const newAlignContentValue = (loginScreenRef.current.clientHeight < verticallyCenteredContentRef.current.offsetHeight) ? 
            "start" : 
            "center";

            if (loginScreenRef.current.style.alignContent !== newAlignContentValue){
                loginScreenRef.current.style.alignContent = newAlignContentValue;
            }
        }

        setLoginScreenMinWidth();
        window.addEventListener('resize', setLoginScreenMinWidth);

        return () => {
            window.removeEventListener('resize', setLoginScreenMinWidth)
        };
    }, []);

    return <form ref={loginScreenRef} className="LogInScreen" onSubmit={respondToOnSubmit}>
        <div ref={verticallyCenteredContentRef}  className="vertically-centered-content">
            <div className="horizontally-centered-content">
                <div className="title">Log In</div>

                <CustomTextField isEnabled={!isLoading} className="username-text-field" topText="Username" placeholderText="Enter your username"  value={usernameText} onValueChange={setUsernameText} />
                <CustomTextField isEnabled={!isLoading} className="password-text-field" isPassword topText="Password" placeholderText="Enter your passcode" value={passwordText} onValueChange={setPasswordText} />

                {(() => {
                    if (errorMessage) {
                        return <ErrorMessageBox errorMessage={errorMessage}/>
                    }
                })()}

                <LoadingButton className="login-button" shouldShowIndicator={isLoading}>
                    Log In
                </LoadingButton>
            </div>
        </div>
    </form>
}


