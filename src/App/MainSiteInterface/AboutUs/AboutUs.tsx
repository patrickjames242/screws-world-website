
import React from 'react';
import './AboutUs.scss';
import { useSetTitleFunctionality } from 'jshelpers';
import HeadedUpPageContainer from 'random-components/HeadedUpPageContainer/HeadedUpPageContainer';
import { PageHeaderProps } from 'random-components/PageHeader/PageHeader';
import screwsWorldFrontView from './images/screws-world-front.jpeg';




export default function AboutUs() {

    useSetTitleFunctionality("About Us");

    const pageHeaderProps: PageHeaderProps = {
        title: "About Us",
        subtitle: "Learn why Screws and Fasteners World is the number one fasteners retailer in The Bahamas."
    };

    return <HeadedUpPageContainer className="AboutUs" pageHeaderProps={pageHeaderProps} stylingProps={{ maxContentWidth: "80rem" }}>

        <div className="AboutUs-children-items">
            <IntroBox />
            <CenteredTitleAndDescription title="Humble Beginnings" description={
                `While perusing through a junk yard looking at screws, the proprietor of Screws & Fasteners World, Patricia Cleare, conceived the idea of a business that would offer screws, nuts and bolts to Bahamians. 
                
                Originally the plan was to make custom screws in-house, but this idea proved too expensive. It was decided that the business would simply sell these items instead.
                
                In 2004, Screws World first opened its doors in a rented building on East Street. The business was well received and began growing and displaying a lot of potential. Later on, the business moved to its own building on Balfour Avenue, where it remains today.`
            }/>
        </div>

    </HeadedUpPageContainer>
}


function IntroBox() {
    return <ScreenWidthStretchingBox className="IntroBox">
        <div className="image-section">
            <div>
                <div className="background-outline"></div>
                <div className="image-holder">
                    <img src={screwsWorldFrontView} alt="" />
                </div>
            </div>
        </div>
        <div className="text-section">
            {(() => {
                return introBoxRightListItems.map((x, num) =>
                    <IntroBoxRightListItem key={num} title={x.title} description={x.description} />)
            })()}
        </div>
    </ScreenWidthStretchingBox>
}

interface IntroBoxRightListItemProps {
    title: string,
    description: string,
}

const introBoxRightListItems = (() => {

    const yearStarted = 2004;
    const yearsInBusiness = (() => {
        const currentYear = (new Date()).getFullYear();
        return currentYear - yearStarted;
    })();

    const items: IntroBoxRightListItemProps[] = [
        {
            title: "Fully Bahamian owned",
            description: "Screws World is owned an operated by Bahamians in Nassau, Bahamas.",
        },
        {
            title: `Started in ${yearStarted}`,
            description: `Screws World has been serving Bahamians with quality screws and fasteners for the last ${yearsInBusiness} years.`,
        },
        {
            title: "People stop here first!",
            description: "Screws world is the self-proclaimed number one screws and fasteners store in The Bahamas.",
        },
    ]
    return items;
})();

function IntroBoxRightListItem(props: { title: string, description: string }) {
    return <div className="IntroBoxRightListItem">
        <HeadingSeparatorLine/>
        <div className="title">{props.title}</div>
        <div className="description">{props.description}</div>
    </div>
}



function CenteredTitleAndDescription(props: {title: string, description: string}){
    return <div className="CenteredTitleAndDescription">
        <h2 className="title">{props.title}</h2>
        <HeadingSeparatorLine/>
        <p className="description">{props.description}</p>
    </div>
}


function HeadingSeparatorLine(){
    return <div className="HeadingSeparatorLine"/>
}


function ScreenWidthStretchingBox(props: { className?: string, children?: React.ReactNode }) {
    const className = ["ScreenWidthStretchingBox", props.className ?? ""].join(" ");
    return <div className={className}>
        <div className="inner-content">
            {props.children}
        </div>
    </div>
}

