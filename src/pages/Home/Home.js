

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { SelectionType as NavBarSelection } from 'random-components/NavBar/NavBar';
import './Home.scss';

import customerServiceIcon from 'assets/home-screen-images/icon-people.png';
import priceIcon from 'assets/home-screen-images/price.png';
import toolsIcon from 'assets/home-screen-images/tools.png';

import mapboxgl from 'mapbox-gl';
mapboxgl.accessToken = 'pk.eyJ1IjoicGF0cmlja2hhbm5hMjQyIiwiYSI6ImNqcnh2eWVrczBydGo0OWx2dDUyYjhvNnMifQ.SGbGDXppFmFkdUnBxIyoqA';


export default class Home extends React.Component {
    render() {
        return <div className="Home">
            <ShowCase />
            <FeaturesBox />
            <AdditionalInfoBox />
            <MapSection />
        </div>
    }
}


function ShowCase() {
    const S = NavBarSelection;
    const aboutUsPath = S.getRoutePathFor(S.aboutUs);
    const productsPath = S.getRoutePathFor(S.products);

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

    function Feature(props) {
        return <div className="Feature">
            <div className="image-holder">
                <img src={props.image} alt="" />
            </div>
            <div className="title">{props.title}</div>
            <div className="description">{props.description}</div>
        </div>
    }

    Feature.propTypes = {
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        image: PropTypes.string.isRequired
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

    function List({ children }) {
        return <ul className="List">
            {children.map((x, i) => {
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
                tap: false,
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
                {/* <div className="line-separator"></div> */}
                <div className="description">We are located at the junction of Balfour Avenue and Palm Beach Street, and we are open 7AM to 5:30PM, Monday to Friday.</div>
            </div>
        </div>
    </div>

}