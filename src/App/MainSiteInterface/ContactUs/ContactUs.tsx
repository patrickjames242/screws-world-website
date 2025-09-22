import React, { useMemo } from "react";
import "./ContactUs.scss";
import {
  SCREWS_WORLD_EMAILS,
  SCREWS_WORLD_NUMBER,
  useSetTitleFunctionality,
} from "jshelpers";
import { PageHeaderProps } from "random-components/PageHeader/PageHeader";
import HeadedUpPageContainer from "random-components/HeadedUpPageContainer/HeadedUpPageContainer";

interface ContactMethodLink {
  text: string;
  href: string;
  openInNewTab?: boolean;
  ariaLabel: string;
}

interface ContactMethod {
  title: string;
  description: string;
  links: ContactMethodLink[];
}

const FACEBOOK_URL =
  "https://www.facebook.com/Screws-Fasteners-World-1472896606259468/";

export default function ContactUs() {
  useSetTitleFunctionality("Contact Us");

  const pageHeaderProps: PageHeaderProps = useMemo(() => ({
    title: "Reach out to us today!",
    subtitle:
      "Connect with our team using the option that works best for you and we'll get back to you quickly.",
  }), []);

  const contactMethods: ContactMethod[] = useMemo(() => {
    const emailLinks: ContactMethodLink[] = SCREWS_WORLD_EMAILS.map((address) => ({
      text: address,
      href: "mailto:" + address,
      ariaLabel: `Email Screws World at ${address}`,
    }));

    return [
      {
        title: "Email",
        description:
          "Send us a note any time and we'll respond within one business day.",
        links: emailLinks,
      },
      {
        title: "Phone / WhatsApp",
        description:
          "Call or message us on WhatsApp during business hours to speak directly with our staff.",
        links: [
          {
            text: SCREWS_WORLD_NUMBER,
            href: "tel:" + SCREWS_WORLD_NUMBER,
            ariaLabel: `Call or WhatsApp Screws World at ${SCREWS_WORLD_NUMBER}`,
          },
        ],
      },
      {
        title: "Facebook",
        description:
          "Message us on Facebook to follow updates and get quick answers.",
        links: [
          {
            text: "Screws & Fasteners World",
            href: FACEBOOK_URL,
            openInNewTab: true,
            ariaLabel: "Open Screws & Fasteners World on Facebook",
          },
        ],
      },
    ];
  }, []);

  return (
    <HeadedUpPageContainer
      className="ContactUs"
      stylingProps={{ maxContentWidth: "60rem" }}
      pageHeaderProps={pageHeaderProps}
    >
      <div className="body-content-holder">
        <div className="contact-methods-holder">
          {contactMethods.map((method) => (
            <div className="contact-method" key={method.title}>
              <div className="title">{method.title}</div>
              <div
                className={
                  "links" + (method.links.length > 1 ? " multiple-links" : "")
                }
              >
                {method.links.map((link) => {
                  const extraProps = link.openInNewTab
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {};
                  return (
                    <a
                      key={link.href}
                      className="contact-link"
                      href={link.href}
                      aria-label={link.ariaLabel}
                      {...extraProps}
                    >
                      {link.text}
                    </a>
                  );
                })}
              </div>
              <div className="description">{method.description}</div>
            </div>
          ))}
        </div>
      </div>
    </HeadedUpPageContainer>
  );
}
