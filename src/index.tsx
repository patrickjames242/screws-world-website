

import React, { useState, useEffect } from 'react';
import ReactDom from 'react-dom';
import { Route, Switch, BrowserRouter as Router, useHistory } from 'react-router-dom';
import { animated, useTransition } from 'react-spring';

import './index.scss';
import scssVariables from './_helpers.scss';
import { SelectionType as NavBarSelection, getAllSelections, getSelectionItemForRoutePath, getInfoForSelection } from './random-components/NavBar/SelectionType';
import NavBar, { NavBarDelegateRef } from './random-components/NavBar/NavBar';
import Home from './pages/Home/Home';
import AboutUs from './pages/AboutUs/AboutUs';
import Services from './pages/Services/Services';
import Products from './pages/Products/Products';
import ContactUs from './pages/ContactUs/ContactUs'

import Footer from './random-components/Footer/Footer';
import { fixScrollingIssueBecauseOfTransitionAnimation } from 'jshelpers';
import NotFoundPage from 'random-components/NotFoundPage/NotFoundPage';


fixScrollingIssueBecauseOfTransitionAnimation();

const wideNavBarLinksCutOffPoint = window.matchMedia(`(max-width: ${scssVariables.wideNavBarLinksCutOffPoint})`);


function App() {
    const { navBarElement, backgroundDimmerElement } = useNavBarExpandCollapseFunctionality();

    return <div className="App" style={{ marginTop: scssVariables.navBarHeightFromScreenTop }}>
        {navBarElement}
        {backgroundDimmerElement}
        <Switch>
            {getAllSelections().map((x, i) => {
                const selectionInfo = getInfoForSelection(x);
                const path = selectionInfo.routePath;
                const isExact = selectionInfo.pageRouteHasSubRoutes === false;
                return <Route key={i} exact={isExact} path={path} 
                render={() => {
                   return <ComponentForSelection selection={x}/> 
                }} />
            })}
            <Route path="*" component={NotFoundPage} />
        </Switch>
        <Footer />
    </div>
}

function ComponentForSelection(props: {selection: NavBarSelection}){
    const S = NavBarSelection;

    useEffect(() => {
        window.scroll(0, 0);
    }, []);

    const Component = (() => {
        switch (props.selection) {
            case S.Home: return Home;
            case S.AboutUs: return AboutUs;
            case S.Services: return Services;
            case S.Products: return Products;
            case S.ContactUs: return ContactUs;
        }
    })();

    return <Component/>
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
                if (navBarDelegateRef.setNavBarExpanded) {
                    navBarDelegateRef.setNavBarExpanded({ isExpanded: false });
                }
            });
            return unlisten;
        }, []);

        useEffect(() => {
            const listener = (media: MediaQueryListEvent) => {
                if (media.matches === false) {
                    if (navBarDelegateRef.setNavBarExpanded) {
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
            if (navBarDelegateRef.setNavBarExpanded) {
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


function ScreenDimmer(props: { onClick: React.MouseEventHandler, style: React.CSSProperties }) {
    return <animated.div onClick={props.onClick} style={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        position: "fixed",
        top: "0", left: "0", bottom: "0", right: "0",
        zIndex: 5,
        ...props.style,
    }} />
}

ReactDom.render(<Router><App /></Router>, document.getElementById('root'));
