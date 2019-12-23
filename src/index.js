

import React, { useRef, useState, useEffect, useContext } from 'react';
import ReactDom from 'react-dom';
import { Route, Switch, BrowserRouter as Router, useHistory } from 'react-router-dom';
import NavBar, { SelectionType as NavBarSelection } from './random-components/NavBar/NavBar';

import './index.scss';
import scssVariables from './_helpers.scss';

import Home from './pages/Home/Home';
import AboutUs from './pages/AboutUs/AboutUs';
import Services from './pages/Services/Services';
import Products from './pages/Products/Products';
import ContactUs from './pages/ContactUs/ContactUs'

import { animated, useTransition } from 'react-spring';

const wideNavBarLinksCutOffPoint = window.matchMedia(`(max-width: ${scssVariables.wideNavBarLinksCutOffPoint})`);

function App() {

    const history = useHistory();

    const currentItem = NavBarSelection.getItemForRoutePath(history.location.pathname);

    const [shouldDisplayDimmer, setShouldDisplayDimmer] = useState(false);

    function respondToNavBarExpansionStateChange(isExpanded) {
        document.body.style.overflow = isExpanded ? "hidden" : "initial";
        setShouldDisplayDimmer(isExpanded);
    }

    function respondToScreenDimmerClick() {
        navBarDelegateRef.setNavBarExpanded({ isExpanded: false });
    }

    const navBarDelegateRef = {};

    const isInitialRenderRef = useRef(true);

    useEffect(() => {
        isInitialRenderRef.current = false;
        history.listen(() => {
            navBarDelegateRef.setNavBarExpanded({ isExpanded: false });
        });
    }, []);

    const backgroundDimmerTransition = useTransition(shouldDisplayDimmer, null, {
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: {opacity: 0}
    });

    useEffect(() => {
        wideNavBarLinksCutOffPoint.addListener((media) => {
            if (media.matches === false) {
                navBarDelegateRef.setNavBarExpanded({ isExpanded: false, isAnimated: false });
            }
        })
    }, [])

    
    const pageTransition = useTransition(history.location, l => l.pathname, {
        from: { opacity: 0, transform: "translateY(20px) scale(0.95, 0.95)" },
        enter: { opacity: 1, transform: "translateY(0px) scale(1, 1)" },
        leave: {opacity: 0, transform: "translateY(0px) scale(1, 1)"},
        immediate: isInitialRenderRef.current
    });


    return <div className="App" style={{ position: "relative", height: "100vh" }}>
        <NavBar selectedItem={currentItem} onExpansionStateChange={respondToNavBarExpansionStateChange} delegateRef={navBarDelegateRef} />

        {pageTransition.map(({ item, key, props }) => {
            return <animated.div key={key} style={{
                position: "absolute",
                left: "0",right: "0",top: "0",bottom: "0",
                overflow: "scroll",
                ...props
            }}>
                <Switch location={item}>
                    {NavBarSelection.getAll().map((x, i) => {
                        const Component = componentForSelection(x);
                        const path = NavBarSelection.getRoutePathFor(x);
                        return <Route key={i} exact path={path} component={Component} />
                    })}
                </Switch>
            </animated.div>
        })}

        {backgroundDimmerTransition.map(({ item, key, props }) => {
            return item ? <ScreenDimmer key={key} style={props} onClick={respondToScreenDimmerClick} /> : null;
        })}
    </div>
}



function componentForSelection(selection) {
    const S = NavBarSelection;
    switch (selection) {
        case S.home: return Home;
        case S.aboutUs: return AboutUs;
        case S.services: return Services;
        case S.products: return Products;
        case S.contactUs: return ContactUs;
        default: break;
    }
}



function ScreenDimmer(props) {
    return <animated.div onClick={props.onClick} style={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        position: "absolute",
        top: "0", left: "0", width: "100%", height: "100%",
        zIndex: "5",
        ...props.style,
    }} />
}


ReactDom.render(<Router><App /></Router>, document.getElementById('root'));

