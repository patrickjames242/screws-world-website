
import React, { useEffect, useRef } from 'react';
import './AboutUs.scss';
import { useSetTitleFunctionality } from 'jshelpers';
import HeadedUpPageContainer from 'random-components/HeadedUpPageContainer/HeadedUpPageContainer';
import { PageHeaderProps } from 'random-components/PageHeader/PageHeader';
import screwsWorldFrontView from './images/screws-world-front.jpeg';
import ScrewsWorldLocationMap from 'random-components/ScrewsWorldLocationMap/ScrewsWorldLocationMap';




export default function AboutUs() {

    useSetTitleFunctionality("About Us");

    const pageHeaderProps: PageHeaderProps = {
        title: "About Us",
        subtitle: "Learn why Screws and Fasteners World is the number one fasteners retailer in The Bahamas."
    };

    const youtubeVideoEmbed = <iframe title="Screws & Fasteners World Commercial" width={560} height={315} style={{height: "100%", width: "100%"}} src="https://www.youtube.com/embed/K_msVolL0Jk" frameBorder={0} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />

    return <HeadedUpPageContainer className="AboutUs" pageHeaderProps={pageHeaderProps} stylingProps={{ maxContentWidth: "80rem" }}>

        <IntroBox />

        <div className="history-title-and-description">
            <CenteredTitleAndDescription className="history-title-and-description" title="Humble Beginnings" description={
                `While perusing through a junk yard looking at screws, the proprietor of Screws & Fasteners World, Patricia Cleare, conceived the idea of a business that would offer screws, nuts and bolts to Bahamians.\n\nOriginally the plan was to make custom screws in-house, but this idea proved too expensive. It was decided that the business would simply sell these items instead.\n\nIn 2004, Screws World first opened its doors in a rented building on East Street. The business was well received and began growing and displaying a lot of potential. Later on, the business moved to its own building on Balfour Avenue, where it remains today.`
            } />
        </div>

        <CenteredTitleAndDescriptionWithBottomBox title="Come On Down" bottomBoxChildren={youtubeVideoEmbed} description={
            `Watch our award winning 😉 commercial and see why you should stop at Screws & Fasteners World for all your tool, screw and fastener needs.`
        } />

        <CenteredTitleAndDescriptionWithBottomBox className="map-section" bottomBoxChildren={<ScrewsWorldLocationMap/>} title="Where To Find Us" description={
            `You can find us in the three story lime green building on the corner of Balfour Avenue and Palm Beach Street in Nassau Bahamas.\n\nWe open from 7:00 am to 5:00 pm on Mondays through Fridays, on most Sundays from 8:00 am to 11:00 am and sometimes on holidays.`
        } />

    </HeadedUpPageContainer>
}


function IntroBox() {
    const contentHolderRef = useRef<HTMLDivElement>(null);

    useClassNameWhenElementWidthEqualsWindowWidth("stick-to-sides", contentHolderRef);

    return <ScreenWidthStretchingBox className="IntroBox">
        <div ref={contentHolderRef}>
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
            description: "Screws World is the self-proclaimed number one screws and fasteners store in The Bahamas.",
        },
    ]
    return items;
})();

function IntroBoxRightListItem(props: { title: string, description: string }) {
    return <div className="IntroBoxRightListItem">
        <HeadingSeparatorLine />
        <div className="title">{props.title}</div>
        <div className="description">{props.description}</div>
    </div>
}














// *** REUSABLE STUFF ***


function CenteredTitleAndDescription(props: { className?: string, title: string, description: string }) {
    const className = ["CenteredTitleAndDescription", props.className ?? ""].join(" ");
    return <div className={className}>
        <h2 className="title">{props.title}</h2>
        <HeadingSeparatorLine />
        <p className="description">{props.description}</p>
    </div>
}


function CenteredTitleAndDescriptionWithBottomBox(props: { className?: string, title: string, description: string, bottomBoxChildren?: React.ReactNode }) {
    const bottomBoxRef = useRef<HTMLDivElement>(null);

    useClassNameWhenElementWidthEqualsWindowWidth("stick-to-sides", bottomBoxRef);

    const className = ["CenteredTitleAndDescriptionWithBottomBox", props.className ?? ""].join(" ");

    return <ScreenWidthStretchingBox className={className}>

        <div className="title-and-description-holder">
            <CenteredTitleAndDescription title={props.title} description={props.description} />
        </div>

        <div className="bottom-box">
            <div>
                <div ref={bottomBoxRef}>
                    <div>{props.bottomBoxChildren}</div>
                </div>
            </div>
        </div>

    </ScreenWidthStretchingBox>
}


function HeadingSeparatorLine() {
    return <div className="HeadingSeparatorLine" />
}


function ScreenWidthStretchingBox(props: { className?: string, children?: React.ReactNode }) {
    const className = ["ScreenWidthStretchingBox", props.className ?? ""].join(" ");

    return <div className={className}>
        <div className="inner-content">
            {props.children}
        </div>
    </div>
}



function useClassNameWhenElementWidthEqualsWindowWidth(className: string, elementRef: React.RefObject<HTMLElement>) {

    useEffect(() => {

        function respondToEventListener() {
            if (elementRef.current == null) {
                return;
            }

            const windowWidth = window.innerWidth;
            const elementWidth = elementRef.current.offsetWidth;


            if (windowWidth <= elementWidth) {
                elementRef.current.classList.add(className);
            } else {
                elementRef.current.classList.remove(className);
            }
        }
        
        respondToEventListener();
        setTimeout(() => {
            respondToEventListener();
        }, 0);

        window.addEventListener('resize', respondToEventListener);
        
        return () => {
            window.removeEventListener('resize', respondToEventListener);
            elementRef?.current?.classList.remove(className);
        }
    
    }, [elementRef, className]);
}

