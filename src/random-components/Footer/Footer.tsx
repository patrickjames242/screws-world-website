import { SCREWS_WORLD_EMAILS, SCREWS_WORLD_NUMBER } from "jshelpers";
import React from "react";
import "./Footer.scss";

interface ContactMethodLink {
  text: string;
  href: string;
  openInNewWindow?: boolean;
}

interface ContactMethodInfo {
  platform: string;
  links: ContactMethodLink[];
}

export default function Footer() {
  function ContactMethod(props: ContactMethodInfo) {
    return (
      <div className="ContactMethod">
        <div className="platform">{props.platform}</div>
        <div className="info-list">
          {props.links.map((link) => (
            <a
              key={link.href}
              className="info-link"
              href={link.href}
              target={link.openInNewWindow ? "_blank" : undefined}
              rel={link.openInNewWindow ? "noopener noreferrer" : undefined}
            >
              {link.text}
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <footer className="Footer">
      <div className="top-line"></div>
      <div className="text-box">
        <div className="title">Pay us a visit. Give us a Call. Email Us.</div>
        <div className="description">
          We love our customers, and we can't wait to see and hear from you here
          at Screws and Fasteners World.
        </div>
      </div>
      <div className="contact-method-boxes">
        {contactMethods.map((method) => (
          <ContactMethod key={method.platform} {...method} />
        ))}
      </div>
		  <div className="made-by-patrick">
			  Made with ♥ by{" "}
			  <a href="https://patrickhanna.dev" target="_blank" rel="noreferrer">
         	 Patrick Hanna
			  </a>.
        </div>
    </footer>
  );
}

const contactMethods: ContactMethodInfo[] = [
  {
    platform: "Facebook",
    links: [
      {
        text: "@Screws & Fasteners World",
        href: "https://www.facebook.com/Screws-Fasteners-World-1472896606259468/",
        openInNewWindow: true,
      },
    ],
  },
  {
    platform: "Email",
    links: SCREWS_WORLD_EMAILS.map((email) => ({
      text: email,
      href: "mailto:" + email,
    })),
  },
  {
    platform: "Phone",
    links: [
      {
        text: SCREWS_WORLD_NUMBER,
        href: "tel:" + SCREWS_WORLD_NUMBER,
      },
    ],
  },
];
