

import React, { useEffect, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {SelectionType as NavBarSelection, getInfoForSelection} from 'random-components/NavBar/SelectionType';

import './Home.scss';

import customerServiceIcon from 'assets/home-screen-images/icon-people.png';
import priceIcon from 'assets/home-screen-images/price.png';
import toolsIcon from 'assets/home-screen-images/tools.png';
import quotesIcon from './quotes-icon.js';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoicGF0cmlja2hhbm5hMjQyIiwiYSI6ImNqcnh2eWVrczBydGo0OWx2dDUyYjhvNnMifQ.SGbGDXppFmFkdUnBxIyoqA';



export default class Home extends React.Component {
    render() {
        return <div className="Home">
            <ShowCase />
            <FeaturesBox />
            <AdditionalInfoBox />
            <ReviewsSection />
            <MapSection />
        </div>
    }
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

    function Feature(props: {image: string, title: string, description: string}) {
        return <div className="Feature">
            <div className="image-holder">
                <img src={props.image} alt="" />
            </div>
            <div className="title">{props.title}</div>
            <div className="description">{props.description}</div>
        </div>
    }

    const features = featuresDict.map((x, i) => {
        return <Feature title={x.title} description={x.description} image={x.image} key={i} />
    });

    return <div className="FeaturesBox">
        <h1 className="title">At Screws World we don't disappoint!</h1>
        <div className="features">{features}</div>
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


function ReviewsSection() {



    function Review(props: { text: string, author: string, authorTitle: string }) {
        return <div className="Review">
            <div className="review-text">{props.text}</div>

            <div className="author-box">
                <div className="title">{"- " + props.author}</div>
                <div className="profession">{props.authorTitle}</div>
            </div>

        </div>
    }

    return <div className="ReviewsSection">
        <div className="quotes-icon-holder">{quotesIcon}</div>
        <div className="reviews-grid-container">
            <div className="reviews-grid">
                {reviews.map((x, i) => {
                    return <Review key={i} text={x.text} author={x.author} authorTitle={x.authorTitle} />
                })}
            </div>
        </div>

    </div>
}

const reviews = (() => {
    let x = [];
    for (let i = 1; i <= 4; i++) {
        x.push({
            text: "Lorem ipsum dolor sit amet consect adipisi elit. Harum, vel!",
            author: "Charles Sawyer",
            authorTitle: "Local Carpenter",

        })
    }
    return x;
})();




function MapSection() {

    const mapDivID = "Home-Page-MapSection-map-view";

    useEffect(() => {
        const timeOutID = setTimeout(() => {
            const center = { lon: -77.339006, lat: 25.052057 };
            const map = new mapboxgl.Map({
                container: mapDivID,
                style: 'mapbox://styles/patrickhanna242/cjs0x6hqx0co31fmqmxjluf1w',
                center: center,
                zoom: 14.5,
            });
            new mapboxgl.Marker({ color: "#0470d9" }).setLngLat(center).addTo(map);
        }, 1000);
        return () => clearTimeout(timeOutID);
    }, []);

    return <div className="MapSection">
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

