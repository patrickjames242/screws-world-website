
import React from 'react';
import './Footer.scss';
import { SCREWS_WORLD_NUMBER, SCREWS_WORLD_EMAIL } from 'jshelpers';


export default function Footer() {

    function ContactMethod({ platform, info, link, shouldOpenInNewWindow = false}) {
        return <a href={link} target={ shouldOpenInNewWindow ? "_blank" : ""} rel="noopener noreferrer" className="ContactMethod">
            <div className="platform">{platform}</div>
            <div className="info">{info}</div>
        </a>
    }


    return <div className="Footer">
        <div className="top-line"></div>
        <div className="text-box">
            <div className="title">Pay us a visit. Give us a Call. Email Us.</div>
            <div className="description">We love our customers, and we can't wait to see and hear from you here at Screws and Fasteners World.</div>
        </div>
        <div className="contact-method-boxes">
            {contactMethods.map((x, i) => {
                return <ContactMethod key={i} platform={x.platform} info={x.info} link={x.link} shouldOpenInNewWindow={x.shouldOpenInNewWindow}/>
            })}
        </div>
    </div>
}

const contactMethods = [
    { platform: "Facebook", info: "@Screws & Fasteners World", link: "https://www.facebook.com/Screws-Fasteners-World-1472896606259468/", shouldOpenInNewWindow: true},
    { platform: "Email", info: SCREWS_WORLD_EMAIL, link: "mailto:" + SCREWS_WORLD_EMAIL},
    { platform: "Phone", info: SCREWS_WORLD_NUMBER, link: "tel:" + SCREWS_WORLD_NUMBER}
];