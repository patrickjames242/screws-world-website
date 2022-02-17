
import { useScreenDimmerFunctions } from 'App/ScreenDimmer';
import aboutUsIcon from 'assets/nav-bar-icons/about-us.js';
import contactIcon from 'assets/nav-bar-icons/contact.js';
import menuIcon from 'assets/nav-bar-icons/menu-icon.js';
import productsIcon from 'assets/nav-bar-icons/products.js';
import screwLogo from 'assets/nav-bar-icons/screws-logo.js';
import servicesIcon from 'assets/nav-bar-icons/services.js';
import { Optional } from 'jshelpers';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useHistory } from 'react-router-dom';
import { animated, useSpring } from 'react-spring';
import scssVariables from '_helpers.module.scss';
import './NavBar.scss';
import { getInfoForSelection, SelectionType } from './SelectionType';








export default function NavBar() {

    const navBarRef = useRef<HTMLDivElement>(null);

    const { toggleIsExpanded, springStyle } = useExpandCollapseFunctionality(navBarRef);



    return <animated.nav ref={navBarRef} style={springStyle} className="NavBar">
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
            <button className="menu-icon-holder" onClick={toggleIsExpanded}>
                {menuIcon}
            </button>
        </div>

        <div className="narrow-links">
            {getAllNavBarLinks()}
        </div>

    </animated.nav>
}

const wideNavBarLinksCutOffPoint = window.matchMedia(`(max-width: ${scssVariables.wideNavBarLinksCutOffPoint})`);

function useExpandCollapseFunctionality(navBarRef: React.MutableRefObject<Optional<HTMLDivElement>>) {


    const navBarHeight = scssVariables.navBarHeight;
    const expandedNarrowNavBoxHeight = scssVariables.totalNavBarHeightWhenExpanded;

    const [isExpanded, setIsExpanded] = useState(false);
    const shouldAnimateNextExpandRef = useRef(true);

    const dimmer = useScreenDimmerFunctions();
    const history = useHistory();

    const _setExpanded = useCallback((isExpanded: ((prevProp: boolean) => boolean) | boolean, isAnimated: boolean) => {
        const updateIsAnimated = () => shouldAnimateNextExpandRef.current = isAnimated ?? true;

        if (typeof isExpanded === "boolean") {
            updateIsAnimated();
            dimmer.setVisibility?.(isExpanded, isAnimated);
            setIsExpanded(isExpanded);
        } else {
            setIsExpanded((prevProp) => {
                const shouldExpand = (isExpanded as (prev: boolean) => boolean)(prevProp);
                updateIsAnimated();
                dimmer.setVisibility?.(shouldExpand, isAnimated);
                return shouldExpand;
            });
        }
    }, [dimmer]);

    useEffect(() => {
        if (isExpanded === false) { return; }
        const removeListener = dimmer.dimmerWasClickedNotification?.addListener?.(() => {
            _setExpanded(false, true);
        });
        if (removeListener){return removeListener;}
        
    }, [isExpanded, _setExpanded, dimmer.dimmerWasClickedNotification]);

    useEffect(() => {
        if (isExpanded === false) { return; }
        const listener = (media: MediaQueryListEvent) => {
            if (media.matches === false) {
                _setExpanded(false, false);
            }
        }
        wideNavBarLinksCutOffPoint.addListener(listener);
        return () => {
            wideNavBarLinksCutOffPoint.removeListener(listener)
        }

    }, [isExpanded, _setExpanded]);

    useEffect(() => {
        if (isExpanded === false) { return; }
        const unlisten = history.listen(() => {
            _setExpanded(false, true);
        });
        return unlisten;
    }, [isExpanded, _setExpanded, history]);

    const toggleIsExpanded = () => _setExpanded((prev) => !prev, true);

    const springStyle = useSpring({
        to: { height: isExpanded ? expandedNarrowNavBoxHeight : navBarHeight },
        config: {
            tension: 375,
            friction: isExpanded ? 28 : 34,
        },
        immediate: !shouldAnimateNextExpandRef.current,

        // we adjust the z value on start and on rest so that the nav bar is only on top of the background dimmer when it is presented, and at all other times it is beneath it. This is done so that in the event that any other component presentes the background dimmer, the nav bar will be benath it (obviously).
        onStart: () => {
            if (navBarRef.current) {
                navBarRef.current.style.zIndex = '100';
            }
        },

        onRest: () => {
            if (navBarRef.current && isExpanded === false) {
                (navBarRef.current.style as any).zIndex = null;
            }
        }
    });

    return { isExpanded, toggleIsExpanded, springStyle };
}



function getAllNavBarLinks() {
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



function NavBarLink(props: { item: SelectionType, image: React.ReactElement<any, any>, text: string }) {
    const { routePath } = getInfoForSelection(props.item);

    return <NavLink className="NavBarLink" to={routePath} activeClassName="selected">
        <div className="icon-container">{props.image}</div>
        <div className="text-box">{props.text}</div>
    </NavLink>
}



