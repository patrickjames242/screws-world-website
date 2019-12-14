import React from 'react';
import PropTypes from 'prop-types';
import './NavBar.scss';

import screwLogo from 'assets/nav-bar-icons/screws-logo.js';
import servicesIcon from 'assets/nav-bar-icons/services.js';
import productsIcon from 'assets/nav-bar-icons/products.js';
import contactIcon from 'assets/nav-bar-icons/contact.js';
import aboutUsIcon from 'assets/nav-bar-icons/about-us.js';

export default class NavBar extends React.Component{
    render(){
        return <div className="NavBar">
            <div className="title-box">
                <div className="screw-logo-holder">{screwLogo}</div>
                <div className="text">
                    <span>Screws</span> 
                    <span>World</span>
                </div>
            </div>
            <div className="links-box">
                {
                    [{name: "About Us", image: aboutUsIcon}, 
                    {name: "Services", image: servicesIcon}, 
                    {name: "Products", image: productsIcon}, 
                    {name: "Contact Us", image: contactIcon}]
                    .map((x, i) => 
                        <NavBarLink text={x.name} image={x.image} key={i}/>
                    )
                }
            </div>
        </div>
    }
}

function NavBarLink(props){
    return <div className="NavBarLink">
        <div className="icon-container">{props.image}</div>
        <div className="text-box">{props.text}</div>
    </div>
}

NavBarLink.propTypes = {
    text: PropTypes.string.isRequired,
    image: PropTypes.element.isRequired
}