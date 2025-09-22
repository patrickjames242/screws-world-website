import React, { useMemo } from "react";
import "./ContactUs.scss";
import {
  SCREWS_WORLD_EMAIL,
  SCREWS_WORLD_NUMBER,
  useSetTitleFunctionality,
} from "jshelpers";
import { PageHeaderProps } from "random-components/PageHeader/PageHeader";
import HeadedUpPageContainer from "random-components/HeadedUpPageContainer/HeadedUpPageContainer";

interface ContactMethod {
  title: string;
  info: string;
  description: string;
  link: string;
  shouldOpenInNewTab?: boolean;
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

  const contactMethods: ContactMethod[] = useMemo(
    () => [
      {
        title: "Email",
        info: SCREWS_WORLD_EMAIL,
        description: "Send us a note any time and we'll respond within one business day.",
        link: "mailto:" + SCREWS_WORLD_EMAIL,
      },
      {
        title: "Phone",
        info: SCREWS_WORLD_NUMBER,
        description: "Give us a call during business hours to speak directly with our staff.",
        link: "tel:" + SCREWS_WORLD_NUMBER,
      },
      {
        title: "Facebook",
        info: "Screws & Fasteners World",
        description: "Message us on Facebook to follow updates and get quick answers.",
        link: FACEBOOK_URL,
        shouldOpenInNewTab: true,
      },
    ],
    []
  );

  return (
    <HeadedUpPageContainer
      className="ContactUs"
      stylingProps={{ maxContentWidth: "60rem" }}
      pageHeaderProps={pageHeaderProps}
    >
      <div className="body-content-holder">
        <div className="contact-methods-holder">
          {contactMethods.map((method) => {
            const { shouldOpenInNewTab = false } = method;
            const extraProps = shouldOpenInNewTab
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {};
            return (
              <a
                key={method.title}
                className="contact-method"
                href={method.link}
                aria-label={`Contact Screws World via ${method.title}`}
                title={`Contact Screws World via ${method.title}`}
                {...extraProps}
              >
                <div className="title">{method.title}</div>
                <div className="info">{method.info}</div>
                <div className="description">{method.description}</div>
              </a>
            );
          })}
        </div>
      </div>
    </HeadedUpPageContainer>
  );
}
