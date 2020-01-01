

import React, { useState, useEffect, useRef } from 'react';
import ReactDom from 'react-dom';
import { Route, Switch, BrowserRouter as Router, useHistory } from 'react-router-dom';
import { animated, useTransition } from 'react-spring';

import './index.scss';
import scssVariables from './_helpers.scss';
import {SelectionType as NavBarSelection, getAllSelections, getSelectionItemForRoutePath, getInfoForSelection} from './random-components/NavBar/SelectionType';
import NavBar, { NavBarDelegateRef } from './random-components/NavBar/NavBar';
import Home from './pages/Home/Home';
import AboutUs from './pages/AboutUs/AboutUs';
import Services from './pages/Services/Services';
import Products from './pages/Products/Products';
import ContactUs from './pages/ContactUs/ContactUs'

import Footer from './random-components/Footer/Footer';
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
    const navBarDelegateRef: NavBarDelegateRef = {};
    const history = useHistory();


    /* eslint-disable react-hooks/rules-of-hooks */

    const navBarElement = (() => {

        function respondToNavBarExpansionStateChange(isExpanded: boolean) {
            document.body.style.overflow = isExpanded ? "hidden" : "initial";
            setShouldDisplayDimmer(isExpanded);
        }

        useEffect(() => {
            const unlisten = history.listen(() => {
                if (navBarDelegateRef.setNavBarExpanded){
                    navBarDelegateRef.setNavBarExpanded({ isExpanded: false });
                }
            });
            return unlisten;
        }, []);

        useEffect(() => {
            const listener = (media: MediaQueryListEvent) => {
                if (media.matches === false) {
                    if (navBarDelegateRef.setNavBarExpanded){
                        navBarDelegateRef.setNavBarExpanded({ isExpanded: false, isAnimated: false });
                    }
                }
            }
            wideNavBarLinksCutOffPoint.addListener(listener);
            return () => {
                wideNavBarLinksCutOffPoint.removeListener(listener)
            }
        }, []);

        
        const currentItem = getSelectionItemForRoutePath(history.location.pathname)!;

        return <NavBar selectedItem={currentItem} onExpansionStateChange={respondToNavBarExpansionStateChange} delegateRef={navBarDelegateRef} />

    })();


    const backgroundDimmerElement = (() => {

        const backgroundDimmerTransition = useTransition(shouldDisplayDimmer, null, {
            from: { opacity: 0 },
            enter: { opacity: 1 },
            leave: { opacity: 0 }
        });

        function respondToScreenDimmerClick() {
            if (navBarDelegateRef.setNavBarExpanded){
                navBarDelegateRef.setNavBarExpanded({ isExpanded: false });
            }
            
        }

        return backgroundDimmerTransition.map(({ item, key, props }) => {
            return item ? <ScreenDimmer key={key} style={props} onClick={respondToScreenDimmerClick} /> : null;
        });

    })();

    /* eslint-enable react-hooks/rules-of-hooks */

    return { backgroundDimmerElement, navBarElement };

}

interface IndexableObject<ResultType>{
    [i: string]: ResultType; 
}

function usePageTransitionFunctionality() {



    type DivRefType = React.RefObject<HTMLDivElement & {scrollTopWasAlreadySet?: boolean}>;
        
    
    const animatedDivRefs = useRef<IndexableObject<DivRefType>>({}).current;

    function animatedDivRefForPath(pathname: string): DivRefType {
        const divRef = animatedDivRefs[pathname];
        if (divRef) {
            return divRef;
        } else {
            return animatedDivRefs[pathname] = React.createRef();
        }
    }

    const history = useHistory();

    function respondToOnStart(location: Location, event: string) {
        if (event === "leave") {
            const ref = animatedDivRefs[location.pathname]?.current;
            if (!ref){return}
            const scrollVal = document.documentElement.scrollTop;
            if (ref.scrollTopWasAlreadySet || scrollVal === 0) { return; }
            ref.style.overflow = "hidden";
            ref.style.bottom = "0";
            ref.scrollTop = scrollVal;
            ref.scrollTopWasAlreadySet = true;
            document.documentElement.scrollTop = 0;
        }
    }

    function respondToOnRest(location: Location, event: string) {
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
        
        onStart: respondToOnStart as any,
        
    });
    console.warn("used casting below to forcebly add the function to the object. Fix it!");

    (pageTransition as any).onRest = respondToOnRest;

    return pageTransition.map(({ item, key, props }) => {
        return <animated.div ref={animatedDivRefForPath(item.pathname)} key={key} style={{
            position: "absolute",
            left: "0", right: "0", top: "0",
            minHeight: "100vh",
            ...props
        }}>
            <Switch location={item}>
                {getAllSelections().map((x, i) => {
                    const Component = componentForSelection(x);
                    const path = getInfoForSelection(x).routePath;
                    return <Route key={i} exact path={path} component={Component} />
                })}
            </Switch>
            <Footer/>
        </animated.div>
    });
}

function componentForSelection(selection: NavBarSelection): any {
    const S = NavBarSelection;
    switch (selection) {
        case S.Home: return Home;
        case S.AboutUs: return AboutUs;
        case S.Services: return Services;
        case S.Products: return Products;
        case S.ContactUs: return ContactUs;
        default: break;
    }

    throw new Error("invalid value sent to selection parameter");
}


function ScreenDimmer(props: {onClick: React.MouseEventHandler, style: React.CSSProperties}) {
    return <animated.div onClick={props.onClick} style={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        position: "fixed",
        top: "0", left: "0", bottom: "0", right: "0",
        zIndex: 5,
        ...props.style,
    }} />
}

ReactDom.render(<Router><App /></Router>, document.getElementById('root'));
