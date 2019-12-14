import React from 'react';
import {Link} from 'react-router-dom';
import {SelectionType as NavBarSelection} from 'random-components/NavBar/NavBar';
import './Home.scss';

export default class Home extends React.Component{
    render(){
        return <div className="Home">
            <ShowCase/>
        </div>  
    }
}


function ShowCase() {
    const S = NavBarSelection;
    const aboutUsPath = S.getRoutePathFor(S.aboutUs);
    const productsPath = S.getRoutePathFor(S.products);

    return <div className="ShowCase">
        <div className="center-content">
            <h1 className="motto-title">Come, Let's Screw Your World!</h1>
            <p className="description-text">Screws and Fasteners World has screws, bolts and repair parts. We open for emergencies and sometimes on holidays.</p>
            <div className="buttons-box">
                <Link to={productsPath} className="browse-products-button">Browse Products</Link>
                <Link to={aboutUsPath} className="about-us-button">
                    <span className="text">Learn More</span>
                    <span className="chevron">&rsaquo;</span>
                </Link>
            </div>
        </div>
    </div>
}