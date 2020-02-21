
import React from 'react';
import './ContactUs.scss';
import { SCREWS_WORLD_EMAIL, SCREWS_WORLD_NUMBER, useSetTitleFunctionality } from 'jshelpers';
import { PageHeaderProps } from 'random-components/PageHeader/PageHeader';

import CustomTextField, {CustomTextFieldType} from 'random-components/CustomInputs/CustomTextField/CustomTextField';
import HeadedUpPageContainer from 'random-components/HeadedUpPageContainer/HeadedUpPageContainer';




export default function ContactUs() {
    useSetTitleFunctionality("Contact Us");

    const textFieldsInfo = [
        {
            topText: "Your email address",
            placeholderText: "jane.appleseed@screwsworld.com",
        },
        {
            topText: "Your name",
            placeholderText: "How do we address you?",
        },
        {
            topText: "Subject",
            placeholderText: "Let us know how can we help you!",
        },
        {
            topText: "Full description",
            placeholderText: "Please include as much information as possible.",
            type: CustomTextFieldType.MultipleLine,
        },
    ];

    const pageHeaderProps: PageHeaderProps = {
        title: "Reach out to us today!",
        subtitle: "Please fill out the form below, email us, or call us, and one of our employees will be in touch with you shortly."
    }

    return <HeadedUpPageContainer className="ContactUs" stylingProps={{maxContentWidth: "60rem"}} pageHeaderProps={pageHeaderProps}>
        <div className="body-content-holder">
                <div className="text-fields">
                    {textFieldsInfo.map((x, i) => {
                        return <CustomTextField type={x.type} topText={x.topText} placeholderText={x.placeholderText} key={i} />
                    })}
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








