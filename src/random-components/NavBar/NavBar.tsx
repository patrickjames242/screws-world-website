
import React, { useState, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './NavBar.scss';

import screwLogo from 'assets/nav-bar-icons/screws-logo.js';
import servicesIcon from 'assets/nav-bar-icons/services.js';
import productsIcon from 'assets/nav-bar-icons/products.js';
import contactIcon from 'assets/nav-bar-icons/contact.js';
import aboutUsIcon from 'assets/nav-bar-icons/about-us.js';

import menuIcon from 'assets/nav-bar-icons/menu-icon.js';
import { useUpdateEffect } from 'jshelpers';
import { animated, useSpring } from 'react-spring';
import scssVariables from '_helpers.scss';

import {SelectionType, getInfoForSelection} from './SelectionType';


export interface NavBarDelegateRef{
    setNavBarExpanded?: (options: {isExpanded: boolean, isAnimated?: boolean})  => void;
}


export interface NavBarProps{
    selectedItem: SelectionType;
    delegateRef: NavBarDelegateRef;
    onExpansionStateChange?: (isExpanded: boolean) => void;
}


export default function NavBar(props: NavBarProps) {

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
                {getAllNavBarLinks()}
            </div>
            <button className="menu-icon-holder" onClick={toggleIsExpanded}>{menuIcon}</button>
        </div>

        <div className="narrow-links">
            {getAllNavBarLinks()}
        </div>

    </animated.div>
}



function useExpandCollapseFunctionality(props: NavBarProps) {

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
            tension: 375, 
            friction: isExpanded ? 28: 34,
        },
        immediate: !shouldAnimateNextExpandRef.current
    });

    useUpdateEffect(() => {
        if (props.onExpansionStateChange){
            props.onExpansionStateChange(isExpanded);
        }
    }, [isExpanded])

    return { isExpanded, setIsExpanded, toggleIsExpanded, springStyle }
}

function getAllNavBarLinks(){
    const S = SelectionType;
    
    return [{ image: aboutUsIcon, item: S.AboutUs },
        { image: servicesIcon, item: S.Services },
        { image: productsIcon, item: S.Products },
        { image: contactIcon, item: S.ContactUs }]
            .map((x, i) => {
                const name = getInfoForSelection(x.item).textValue;
                return <NavBarLink text={name} image={x.image} item={x.item} key={i} />
            });
}

function NavBarLink(props: {item: SelectionType, image: React.ReactElement<any, any>, text: string}) {
    const {routePath, pageRouteHasSubRoutes} = getInfoForSelection(props.item);

    return <NavLink className="NavBarLink" exact={!pageRouteHasSubRoutes} to={routePath} activeClassName="selected">
        <div className="icon-container">{props.image}</div>
        <div className="text-box">{props.text}</div>
    </NavLink>
}



