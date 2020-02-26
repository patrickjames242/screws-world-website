
import React, { useRef, useState } from 'react';
import './ContactUs.scss';
import { SCREWS_WORLD_EMAIL, SCREWS_WORLD_NUMBER, useSetTitleFunctionality } from 'jshelpers';
import { PageHeaderProps } from 'random-components/PageHeader/PageHeader';

import CustomTextField, {CustomTextFieldType} from 'random-components/CustomInputs/CustomTextField/CustomTextField';
import HeadedUpPageContainer from 'random-components/HeadedUpPageContainer/HeadedUpPageContainer';


const textFieldsInfo = {
    email: {
        topText: "Your email address",
        placeholderText: "jane.appleseed@screwsworld.com",
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


export default function ContactUs() {
    useSetTitleFunctionality("Contact Us");

    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");



    const pageHeaderProps: PageHeaderProps = useRef({
        title: "Reach out to us today!",
        subtitle: "Please fill out the form below, email us, or call us, and one of our employees will be in touch with you shortly."
    }).current;

    return <HeadedUpPageContainer className="ContactUs" stylingProps={{maxContentWidth: "60rem"}} pageHeaderProps={pageHeaderProps}>
        <div className="body-content-holder">
                <div className="text-fields">
                    
                    <CustomTextField {...textFieldsInfo.email} value={email} onValueChange={setEmail}/>
                    <CustomTextField {...textFieldsInfo.name} value={name} onValueChange={setName}/>
                    <CustomTextField {...textFieldsInfo.subject} value={subject} onValueChange={setSubject}/>
                    <CustomTextField {...textFieldsInfo.description} value={description} onValueChange={setDescription} type={CustomTextFieldType.MultipleLine} />

                    <button className="submit-button">Submit</button>
                </div>
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








