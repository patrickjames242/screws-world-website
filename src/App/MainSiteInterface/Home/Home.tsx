

import React, { useEffect, ReactNode, useRef } from 'react';
import { Link } from 'react-router-dom';
import { SelectionType as NavBarSelection, getInfoForSelection } from 'random-components/NavBar/SelectionType';

import './Home.scss';

import customerServiceIcon from 'assets/home-screen-images/icon-people.png';
import priceIcon from 'assets/home-screen-images/price.png';
import toolsIcon from 'assets/home-screen-images/tools.png';
import quotesIcon from './quotes-icon.js';
import mapboxgl from 'mapbox-gl';
import { useSetTitleFunctionality } from 'jshelpers';
mapboxgl.accessToken = 'pk.eyJ1IjoicGF0cmlja2hhbm5hMjQyIiwiYSI6ImNqcnh2eWVrczBydGo0OWx2dDUyYjhvNnMifQ.SGbGDXppFmFkdUnBxIyoqA';



export default function Home() {

    useSetTitleFunctionality("Home");

    return <div className="Home">
        <ShowCase />
        <FeaturesBox />
        <AdditionalInfoBox />
        <ReviewsSection />
        <MapSection />
    </div>

}


function ShowCase() {
    const S = NavBarSelection;
    const aboutUsPath = getInfoForSelection(S.AboutUs).routePath;
    const productsPath = getInfoForSelection(S.Products).routePath;

    return <div className="ShowCase">
        <div className="background-view"></div>
        <div className="center-content">
            <h1 className="motto-title">Come, Let's Screw Your World!</h1>
            <p className="description-text">Screws and Fasteners World has screws, bolts and repair parts. We open for emergencies and sometimes on holidays.</p>
            <div className="buttons-box">
                <Link to={productsPath} className="browse-products-button">
                    See Products
                </Link>
                <Link to={aboutUsPath} className="about-us-button">
                    <span className="text">Learn More</span>
                    <span className="chevron">&rsaquo;</span>
                </Link>
            </div>
        </div>
    </div>
}


function FeaturesBox() {

    const features = featuresDict.map((x, i) => {
        return <IndividualFeatureBox title={x.title} description={x.description} image={x.image} key={i} />
    });

    return <div className="FeaturesBox">
        <h1 className="title">At Screws World we don't disappoint!</h1>
        <div className="features">{features}</div>
    </div>
}

function IndividualFeatureBox(props: { image: string, title: string, description: string }) {
    return <div className="IndividualFeatureBox">
        <div className="image-holder">
            <img src={props.image} alt="" />
        </div>
        <div className="title">{props.title}</div>
        <div className="description">{props.description}</div>
    </div>
}



const featuresDict = [
    {
        title: "Awesome customer service",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas quasi officiis nihil esse animi saepe amet at eius veritatis nostrum.",
        image: customerServiceIcon,
    },
    {
        title: "Great prices",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas quasi officiis nihil esse animi saepe amet at eius veritatis nostrum.",
        image: priceIcon,
    },
    {
        title: "Wide variety of products",
        description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas quasi officiis nihil esse animi saepe amet at eius veritatis nostrum.",
        image: toolsIcon,
    },

];



function AdditionalInfoBox() {

    function List(props: { children: ReactNode[] }) {
        return <ul className="List">
            {props.children.map((x, i) => {
                return <li className="item" key={i}>{x}</li>
            })}
        </ul>
    }

    return <div className="AdditionalInfoBox">
        <div className="content">
            <div className="left-info-box">
                <div className="title">If you can think of it, we probably have it.</div>
                <div className="description">For all your screw and fastener needs, we have virtually everything you could possibly want.</div>
            </div>
            <div className="right-info-box">
                <List>
                    {[
                        "Philip Screwdrivers",
                        "Stainless steel bolts",
                        "Screws and washers",
                        "Linked Chains"
                    ]}
                </List>
                <List>
                    {[
                        "Nuts and Bolts",
                        "Threaded Rods",
                        "Fishing Lines",
                        "Much, much more!"
                    ]}
                </List>
            </div>
        </div>
    </div>
}

interface Review{
    text: string,
    author: string,
    reviewDate: string,
}

function ReviewsSection() {
    return <div className="ReviewsSection">
        <div className="quotes-icon-holder">{quotesIcon}</div>
        <div className="reviews-grid-container">
            <div className="reviews-grid">
                {reviews.map((x, i) => {
                    return <ReviewBox key={i} {...x}/>
                })}
            </div>
        </div>
    </div>
}

function ReviewBox(props: Review) {
    return <div className="Review">
        <div className="review-text">{`"${props.text}"`}</div>
        <div className="author-box">
            <div className="title">{"- " + props.author}</div>
            <div className="date">{props.reviewDate}</div>
        </div>
    </div>
}

const reviews = (() => {
    let x: Review[] = [];
    for (let i = 1; i <= 4; i++) {
        x.push({
            text: "Lorem ipsum dolor sit amet consect adipisi elit. Harum, vel!",
            author: "Charles Sawyer",
            reviewDate: "September 3, 2019",
        })
    }
    return x;
})();




function MapSection() {

    const mapDivID = "Home-Page-MapSection-map-view";
    const mapSectionDivRef = useRef<HTMLDivElement>(null);

    // map is loaded when its section is actually scrolled into view because loading the map is expensive and slows down the page while it is loading
    useEffect(() => {

        // we display the map immediately if the browser doesn't support the intersection api
        if ('IntersectionObserver' in window === false) {
            displayMapOnScreen();
            return;
        }

        let observer = new IntersectionObserver(intersectionOccured)

        function displayMapOnScreen() {
            const center = { lon: -77.339006, lat: 25.052057 };
            const map = new mapboxgl.Map({
                container: mapDivID,
                style: 'mapbox://styles/patrickhanna242/cjs0x6hqx0co31fmqmxjluf1w',
                center: center,
                zoom: 14.5,
            });
            new mapboxgl.Marker({ color: "#0470d9" }).setLngLat(center).addTo(map);
        }

        function intersectionOccured(entries: IntersectionObserverEntry[]) {
            const entry = entries[0];
            // testing for the isIntersecting property because some older browsers didn't implement it
            if ('isIntersecting' in entry && entry.isIntersecting === false) { return; }
            displayMapOnScreen();
            observer.disconnect();
        }

        if (mapSectionDivRef.current) {
            observer.observe(mapSectionDivRef.current);
        }

        return () => observer.disconnect();

    }, []);

    return <div className="MapSection" ref={mapSectionDivRef}>
        <div className="content">
            <div className="map-holder">
                <div id={mapDivID} className="map"></div>
            </div>

            <div className="text-content">
                <div className="title">Come and pay us a visit!</div>
                <div className="description">We are located at the junction of Balfour Avenue and Palm Beach Street, and we are open 7AM to 5:30PM, Monday to Friday.</div>
            </div>
        </div>
    </div>

}

