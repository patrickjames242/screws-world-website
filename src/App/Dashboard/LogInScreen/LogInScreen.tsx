
import React, { useState } from "react";
import CustomTextField from 'random-components/CustomTextField/CustomTextField';
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

    return <form className="LogInScreen" onSubmit={respondToOnSubmit}>
        <div className="vertically-centered-content">
            <div className="horizontally-centered-content">
                <div className="title">Log In</div>

                <CustomTextField className="username-text-field" topText="Username" placeholderText="Enter your username"  value={usernameText} onTextChange={setUsernameText} />
                <CustomTextField className="password-text-field" isPassword topText="Password" placeholderText="Enter your passcode" value={passwordText} onTextChange={setPasswordText} />

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


