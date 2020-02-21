

import React from 'react';
import './Services.scss';
import { useSetTitleFunctionality } from 'jshelpers';
import HeadedUpPageContainer from 'random-components/HeadedUpPageContainer/HeadedUpPageContainer';
import { PageHeaderProps } from 'random-components/PageHeader/PageHeader';
import familyIslandsImage from './images/family-islands.jpg';
import screwsImage from './images/screws.jpg';
import licensePlateImage from './images/license-plate.jpg';
import { Link } from 'react-router-dom';
import * as TopLevelRoutePaths from 'topLevelRoutePaths';

interface Service {
    topSubtitle: string,
    title: string,
    bottomSubtitle: string,
    image: string,
}

export default function Services() {
    useSetTitleFunctionality("Services");

    const pageHeaderProps: PageHeaderProps = {
        title: "Our Services",
        subtitle: "See all the services Screws and Fasteners World have to offer.",
    }

    return <HeadedUpPageContainer className="Services" stylingProps={{ maxContentWidth: "75rem" }} pageHeaderProps={pageHeaderProps}>
        <div className="service-boxes-container">
            {services.map((x, i) => <IndividualServiceBox key={i} service={x} />)}
        </div>
    </HeadedUpPageContainer>
}

const services: Service[] = (() => {
    return [
        {
            topSubtitle: "License Plate Installation",
            title: "We install vehicle license plates",
            bottomSubtitle: "Stop by and one of our employees will assist you with installing your license plate and providing the screws necessary.",
            image: licensePlateImage,
        },
        {
            topSubtitle: "Shipping",
            title: "We ship to the Family Islands",
            bottomSubtitle: "Whether you live in Exuma, Eleuthera, Abaco or any other island, just give us a call and we'll be happy to ship our products to you.",
            image: familyIslandsImage,
        },
        {
            topSubtitle: "Inventory Restocking",
            title: "We restock your screw inventory on request",
            bottomSubtitle: "If you have a business that must maintain an inventory of screws, Screws World will regularly check and replenish your inventory, should you desire.",
            image: screwsImage,
        },
        
    ];
})();



function IndividualServiceBox(props: { service: Service }) {
    return <div className="IndividualServiceBox">
        <div className="image-grid-item">
            <div>
                <div>
                    <div>
                        <img src={props.service.image} alt="" />
                    </div>
                </div>
            </div>
        </div>
        <div className="text-grid-item">
            <div className="top-subtitle">{props.service.topSubtitle}</div>
            <div className="title">{props.service.title}</div>
            <div className="bottom-subtitle">{props.service.bottomSubtitle}</div>
            <Link to={TopLevelRoutePaths.CONTACT_US} className="contact-us-button">
                <div className="text">Contact Us</div>
                <div className="chevron">›</div>
            </Link>
        </div>
    </div>
}

