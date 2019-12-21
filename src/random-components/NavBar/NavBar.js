
import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink } from 'react-router-dom';
import './NavBar.scss';

import screwLogo from 'assets/nav-bar-icons/screws-logo.js';
import servicesIcon from 'assets/nav-bar-icons/services.js';
import productsIcon from 'assets/nav-bar-icons/products.js';
import contactIcon from 'assets/nav-bar-icons/contact.js';
import aboutUsIcon from 'assets/nav-bar-icons/about-us.js';

import menuIcon from 'assets/nav-bar-icons/menu-icon.js';
import { useUpdateEffect } from 'jshelpers';
import { animated, useSpring, config } from 'react-spring';
import scssVariables from '_helpers.scss';

export const SelectionType = {

    home: Symbol('home'),
    aboutUs: Symbol('aboutUs'),
    services: Symbol('services'),
    products: Symbol('products'),
    contactUs: Symbol('contactUs'),

    getAll() {
        return [this.home, this.aboutUs, this.services, this.products, this.contactUs];
    },

    getTextValueFor(item) {
        switch (item) {
            case this.home: return 'home';
            case this.aboutUs: return 'about us';
            case this.services: return 'services';
            case this.products: return 'products';
            case this.contactUs: return 'contact Us';
            default: throw new Error("invalid item sent to 'getTextValueFor'");
        }
    },

    getRoutePathFor(item) {
        return this.routePaths[item];
    },

    getItemForRoutePath(routePath) {
        const result = Object
            .getOwnPropertySymbols(this.routePaths)
            .find(x => this.routePaths[x] === routePath);
        return result;
    }
}

SelectionType.routePaths = (() => {
    const s = SelectionType;
    return {
        [s.home]: '/',
        [s.aboutUs]: '/about-us',
        [s.services]: '/services',
        [s.products]: '/products',
        [s.contactUs]: '/contact-us'
    }
})();










export default function NavBar(props) {

    const { toggleIsExpanded, springStyle } = useExpandCollapseFunctionality(props);


    return <animated.div style={springStyle} className="NavBar">
        <div className="nav-bar-content">
            <Link to="/" className="title-box">
                <div className="screw-logo-holder">{screwLogo}</div>
                <div className="text">
                    <span>Screws</span>
                    <span>World</span>
                </div>
            </Link>
            <div className="links-box">
                {getAllNavBarLinks(props.selectedItem)}
            </div>
            <button className="menu-icon-holder" onClick={toggleIsExpanded}>{menuIcon}</button>
        </div>

        <div className="narrow-links" >
            {getAllNavBarLinks()}
        </div>

    </animated.div>

}

NavBar.propTypes = {
    selectedItem: PropTypes.oneOf(SelectionType.getAll()).isRequired,
    onExpansionStateChange: PropTypes.func.isRequired,
    delegateRef: PropTypes.object.isRequired
}

function useExpandCollapseFunctionality(props) {

    const navBarHeight = scssVariables.navBarHeight;
    const expandedNarrowNavBoxHeight = scssVariables.totalNavBarHeightWhenExpanded;

    const [isExpanded, setIsExpanded] = useState(false);
    const shouldAnimateNextExpandRef = useRef(true);


    function toggleIsExpanded(){
        setIsExpanded((prevState) => {
            shouldAnimateNextExpandRef.current = true;
            return !prevState;
        })
    }

    props.delegateRef.setNavBarExpanded = function({ isExpanded, isAnimated = true}){
        shouldAnimateNextExpandRef.current = isAnimated;
        setIsExpanded(isExpanded);
    };

    const springStyle = useSpring({
        to: { height: isExpanded ? expandedNarrowNavBoxHeight : navBarHeight },
        config: {
            tension: 275, 
            friction: 30,
            duration: shouldAnimateNextExpandRef.current ? undefined : 0,
        }
    });

    useUpdateEffect(() => {
        let func = props.onExpansionStateChange;
        if (func !== undefined) { func(isExpanded); }
    }, [isExpanded])


    return { isExpanded, setIsExpanded, toggleIsExpanded, springStyle }
}


function getAllNavBarLinks(selectedItem){
    const S = SelectionType;
    return [{ image: aboutUsIcon, item: S.aboutUs },
        { image: servicesIcon, item: S.services },
        { image: productsIcon, item: S.products },
        { image: contactIcon, item: S.contactUs }]
            .map((x, i) => {
                const name = SelectionType.getTextValueFor(x.item);
                const isSelected = selectedItem === x.item;
                return <NavBarLink text={name} image={x.image} item={x.item} isSelected={isSelected} key={i} />
            });
}


function NavBarLink(props) {
    const path = SelectionType.getRoutePathFor(props.item);
    return <NavLink className="NavBarLink" exact to={path} activeClassName="selected">
        <div className="icon-container">{props.image}</div>
        <div className="text-box">{props.text}</div>
    </NavLink>
}

NavBarLink.propTypes = {
    text: PropTypes.string.isRequired,
    image: PropTypes.element.isRequired,
    isSelected: PropTypes.bool.isRequired,
    item: PropTypes.oneOf(SelectionType.getAll()).isRequired
}

