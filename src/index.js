

import React, { useState, useEffect, useRef } from 'react';
import ReactDom from 'react-dom';
import { Route, Switch, BrowserRouter as Router, useHistory } from 'react-router-dom';
import { animated, useTransition } from 'react-spring';

import './index.scss';
import scssVariables from './_helpers.scss';

import NavBar, { SelectionType as NavBarSelection } from './random-components/NavBar/NavBar';
import Home from './pages/Home/Home';
import AboutUs from './pages/AboutUs/AboutUs';
import Services from './pages/Services/Services';
import Products from './pages/Products/Products';
import ContactUs from './pages/ContactUs/ContactUs'
import { fixScrollingIssueBecauseOfTransitionAnimation } from 'jshelpers';


fixScrollingIssueBecauseOfTransitionAnimation();

const wideNavBarLinksCutOffPoint = window.matchMedia(`(max-width: ${scssVariables.wideNavBarLinksCutOffPoint})`);


function App() {
    const { navBarElement, backgroundDimmerElement } = useNavBarExpandCollapseFunctionality();
    const currentPageElement = usePageTransitionFunctionality();

    return <div className="App" style={{ position: "relative" }}>
        {navBarElement}
        {backgroundDimmerElement}
        {currentPageElement}
    </div>
}



function useNavBarExpandCollapseFunctionality() {


    const [shouldDisplayDimmer, setShouldDisplayDimmer] = useState(false);
    const navBarDelegateRef = {};
    const history = useHistory();


    /* eslint-disable react-hooks/rules-of-hooks */

    const navBarElement = (() => {

        function respondToNavBarExpansionStateChange(isExpanded) {
            document.body.style.overflow = isExpanded ? "hidden" : "initial";
            setShouldDisplayDimmer(isExpanded);
        }

        useEffect(() => {
            const unlisten = history.listen(() => {
                navBarDelegateRef.setNavBarExpanded({ isExpanded: false });
            });
            return unlisten;
        }, []);

        useEffect(() => {
            const listener = (media) => {
                if (media.matches === false) {
                    navBarDelegateRef.setNavBarExpanded({ isExpanded: false, isAnimated: false });
                }
            }
            wideNavBarLinksCutOffPoint.addListener(listener);
            return () => {
                wideNavBarLinksCutOffPoint.removeListener(listener)
            }
        }, []);

        const currentItem = NavBarSelection.getItemForRoutePath(history.location.pathname);

        return <NavBar selectedItem={currentItem} onExpansionStateChange={respondToNavBarExpansionStateChange} delegateRef={navBarDelegateRef} />

    })();


    const backgroundDimmerElement = (() => {

        const backgroundDimmerTransition = useTransition(shouldDisplayDimmer, null, {
            from: { opacity: 0 },
            enter: { opacity: 1 },
            leave: { opacity: 0 }
        });

        function respondToScreenDimmerClick() {
            navBarDelegateRef.setNavBarExpanded({ isExpanded: false });
        }

        return backgroundDimmerTransition.map(({ item, key, props }) => {
            return item ? <ScreenDimmer key={key} style={props} onClick={respondToScreenDimmerClick} /> : null;
        });

    })();

    /* eslint-enable react-hooks/rules-of-hooks */

    return { backgroundDimmerElement, navBarElement };

}


function usePageTransitionFunctionality() {

    const animatedDivRefs = useRef({}).current;

    function animatedDivRefForPath(pathname) {
        const divRef = animatedDivRefs[pathname];
        if (divRef) {
            return divRef;
        } else {
            return animatedDivRefs[pathname] = React.createRef();
        }
    }

    const history = useHistory();

    function respondToOnStart(location, event) {
        if (event === "leave") {
            const ref = animatedDivRefs[location.pathname];
            if (!ref) { return; }
            const divAboutToLeave = ref.current;
            const scrollVal = document.documentElement.scrollTop;
            if (divAboutToLeave.scrollTopWasAlreadySet || scrollVal === 0) { return; }
            divAboutToLeave.style.overflow = "hidden";
            divAboutToLeave.style.bottom = "0";
            divAboutToLeave.scrollTop = scrollVal;
            divAboutToLeave.scrollTopWasAlreadySet = true;
        }
    }

    function respondToOnRest(location, event) {
        Object.values(animatedDivRefs).forEach(ref => {
            if (!ref.current) { return; }
            ref.current.style.transform = "initial"
        });

        if (event !== "leave") { return; }
        delete animatedDivRefs[location.pathname];
    }

    const pageTransition = useTransition(history.location, l => l.pathname, {
        from: { opacity: 0, transform: "translateY(1.25rem) scale(0.95, 0.95)" },
        enter: { opacity: 1, transform: "translateY(0rem) scale(1, 1)" },
        leave: { opacity: 0 },
        config: {tension: 300, friction: 22.5},
        
        onStart: respondToOnStart,
        onRest: respondToOnRest,
    });
    return pageTransition.map(({ item, key, props }) => {
        return <animated.div className="the-class" ref={animatedDivRefForPath(item.pathname)} key={key} style={{
            position: "absolute",
            left: "0", right: "0", top: "0",
            minHeight: "100vh",
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
    });
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
        position: "fixed",
        top: "0", left: "0", bottom: "0", right: "0",
        zIndex: "5",
        ...props.style,
    }} />
}




ReactDom.render(<Router><App /></Router>, document.getElementById('root'));


