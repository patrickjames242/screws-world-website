
import React, { useRef, useState } from 'react';
import './ContactUs.scss';
import { SCREWS_WORLD_EMAIL, SCREWS_WORLD_NUMBER, useSetTitleFunctionality, useBlockHistoryWhileMounted, isValidEmail, Optional } from 'jshelpers';
import { PageHeaderProps } from 'random-components/PageHeader/PageHeader';

import CustomTextField, { CustomTextFieldType } from 'random-components/CustomInputs/CustomTextField/CustomTextField';
import HeadedUpPageContainer from 'random-components/HeadedUpPageContainer/HeadedUpPageContainer';
import { sendEmailMessage } from 'API';
import LoadingButton from 'random-components/LoadingButton/LoadingButton';
import ErrorMessageBox from 'random-components/ErrorMessageBox/ErrorMessageBox';


const textFieldsInfo = {
    email: {
        topText: "Your email address",
        placeholderText: "jane.appleseed@example.com",
    },
    name: {
        topText: "Your name",
        placeholderText: "How do we address you?",
    },
    subject: {
        topText: "Subject",
        placeholderText: "Let us know how can we help you!",
    },
    description: {
        topText: "Full description",
        placeholderText: "Please include as much information as possible.",
    }
}

enum EmailRequestResultType {
    SUCCESS, FAILURE
}

interface EmailRequestResult {
    type: EmailRequestResultType,
    message: string,
}


export default function ContactUs() {
    useSetTitleFunctionality("Contact Us");

    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    let [requestResult, setRequestResult] = useState<Optional<EmailRequestResult>>(null);
    
    const areThereChanges = (() => {
        return [email, name, subject, description]
            .some(x => x.trim().length > 0);
    })();

    useBlockHistoryWhileMounted('If you leave this page, all the information you have entered so far will be lost', areThereChanges);

    const pageHeaderProps: PageHeaderProps = useRef({
        title: "Reach out to us today!",
        subtitle: "Please fill out the form below, email us, or call us, and one of our employees will be in touch with you shortly."
    }).current;

    function respondToFormSubmission(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setRequestResult(null);

        const trimmedEmail = email.trim();
        const trimmedName = name.trim();
        const trimmedSubject = subject.trim();
        const trimmedDescription = description.trim();

        if ([trimmedEmail, trimmedName, trimmedSubject, trimmedDescription]
            .some(x => x === "")) {
            setRequestResult({
                type: EmailRequestResultType.FAILURE,
                message: 'Please fill out all fields.'
            });
            return;
        }

        if (isValidEmail(email) !== true) {
            setRequestResult({
                type: EmailRequestResultType.FAILURE,
                message: 'The email you have entered is invalid',
            });
            return;
        }
        setIsLoading(true);
        sendEmailMessage({
            contact_email: trimmedEmail,
            name: trimmedName,
            subject: trimmedSubject,
            description: trimmedDescription,
        }).finally(() => {
            setIsLoading(false);
        }).then(() => {
            
            setEmail(""); setName(""); setSubject(""); setDescription("");

            setRequestResult({
                type: EmailRequestResultType.SUCCESS,
                message: 'Your message was successfully sent',
            });

        }).catch((error) => {
            setRequestResult({
                type: EmailRequestResultType.FAILURE,
                message: error.message,
            })
        });

    }

    


    return <HeadedUpPageContainer className="ContactUs" stylingProps={{ maxContentWidth: "60rem" }} pageHeaderProps={pageHeaderProps}>
        <div className="body-content-holder">
            <form className="text-fields" onSubmit={respondToFormSubmission}>
                <CustomTextField isEnabled={!isLoading} isRequired {...textFieldsInfo.email} value={email} onValueChange={setEmail} />
                <CustomTextField isEnabled={!isLoading} isRequired {...textFieldsInfo.name} value={name} onValueChange={setName} />
                <CustomTextField isEnabled={!isLoading} isRequired {...textFieldsInfo.subject} value={subject} onValueChange={setSubject} />
                <CustomTextField isEnabled={!isLoading} isRequired {...textFieldsInfo.description} value={description} onValueChange={setDescription} type={CustomTextFieldType.MultipleLine} />
                {(() => {
                    if (requestResult == null){return null;}
                    const className = requestResult?.type === EmailRequestResultType.SUCCESS ? "positive" : "";
                    return <ErrorMessageBox errorMessage={requestResult.message} className={className}/>
                    
                })()}
                <LoadingButton shouldShowIndicator={isLoading} className="submit-button">Submit</LoadingButton>
            </form>
            <div className="contact-methods-holder">
                {
                    [
                        [
                            "Email",
                            SCREWS_WORLD_EMAIL,
                            "mailto:" + SCREWS_WORLD_EMAIL
                        ],
                        [
                            "Phone",
                            SCREWS_WORLD_NUMBER,
                            "tel:" + SCREWS_WORLD_NUMBER
                        ]
                    ]
                        .map((x, i) => {
                            return <a className="contact-method" key={i} href={x[2]}>
                                <div className="title">{x[0]}</div>
                                <div className="info">{x[1]}</div>
                            </a>
                        })
                }
            </div>
        </div>
    </HeadedUpPageContainer>



}








