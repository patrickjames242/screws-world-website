
import React, { useRef } from 'react';
import './ContactUs.scss';
import { SCREWS_WORLD_EMAIL, SCREWS_WORLD_NUMBER, useSetTitleFunctionality } from 'jshelpers';
import PageHeader from 'random-components/PageHeader/PageHeader';



enum TextFieldType{
    SingleLine,
    MultipleLine,
}


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
            type: TextFieldType.MultipleLine,
        },
    ];

    return <div className="ContactUs">
        <div className="content">

            <PageHeader title="Reach out to us today!" subtitle="Please fill out the form below, email us, or call us, and one of our employees will be in touch with you shortly." />

            <div className="body-content-holder">
                <div className="text-fields">
                    {textFieldsInfo.map((x, i) => {
                        return <TextField type={x.type} topText={x.topText} placeholderText={x.placeholderText} key={i} />
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
        </div>
    </div>

}


function TextField(props: {
    type?: TextFieldType,
    topText: string,
    placeholderText: string,
    className?: string}) {

    const textFieldRef = useRef<HTMLDivElement>(null);

    const activeClassName = "active";

    function respondToOnFocus() {
        textFieldRef.current?.classList.add(activeClassName);
    }

    function respondToOnBlur() {
        textFieldRef.current?.classList.remove(activeClassName);
    }

    const inputElement = (() => {
        let elementType, typeProp;
        switch (props.type ?? TextFieldType.SingleLine) {
            case TextFieldType.SingleLine:
                elementType = "input"; typeProp = "text";
                break;
            case TextFieldType.MultipleLine:
                elementType = "textarea";
                break;
            default: return null;
        }
        const propDict = {
            className: "text-input " + props.className ?? "",
            placeholder: props.placeholderText,
            onFocus: respondToOnFocus,
            onBlur: respondToOnBlur,
            type: typeProp,
        };
        return React.createElement(elementType, propDict);
    })();
    
    return <div className="TextField" ref={textFieldRef}>
        <div className="top-text">{props.topText}</div>
        {inputElement}
    </div>
}






