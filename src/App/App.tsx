
import React, { useState, useEffect, useRef } from 'react';

import { Route, Switch } from 'react-router-dom';
import { animated, useTransition } from 'react-spring';

import scssVariables from '_helpers.scss';
import { SelectionType as NavBarSelection, getAllSelections, getInfoForSelection } from 'random-components/NavBar/SelectionType';
import NavBar from 'random-components/NavBar/NavBar';
import Home from 'pages/Home/Home';
import AboutUs from 'pages/AboutUs/AboutUs';
import Services from 'pages/Services/Services';
import Products from 'pages/Products/Products';
import ContactUs from 'pages/ContactUs/ContactUs'

import Footer from 'random-components/Footer/Footer';
import NotFoundPage from 'random-components/NotFoundPage/NotFoundPage';
import { DASHBOARD as dashboardRoutePath } from 'routePaths';
import { ScreenDimmerFunctionsContext, ScreenDimmerFunctions, DashboardInfo, DashboardInfoContext } from './AppUIHelpers';
import { Notification } from 'jshelpers';




export default function App() {

    const screenDimmerFunctionsRef = useRef<ScreenDimmerFunctions>({}).current;

    return <ScreenDimmerFunctionsContext.Provider value={screenDimmerFunctionsRef}>
        <div className="App">
            <Switch>
                <Route path={dashboardRoutePath} component={Dashboard} />
                <Route path="*" component={MainSiteInterface} />
            </Switch>
            <ScreenDimmer functionsRef={screenDimmerFunctionsRef} />
        </div>
    </ScreenDimmerFunctionsContext.Provider>
}





function ScreenDimmer(props: { functionsRef: ScreenDimmerFunctions }) {

    const [shouldBeVisible, setVisibilityState] = useState(false);
    const shouldAnimateVisibilityChange = useRef(true);

    function setVisibility(isVisible: boolean, animate: boolean) {
        shouldAnimateVisibilityChange.current = animate;
        document.body.style.overflow = isVisible ? "hidden" : "initial";
        setVisibilityState(isVisible);
    }

    const dimmerWasClickedNotification = useRef(new Notification()).current;

    props.functionsRef.setVisibility = setVisibility;
    props.functionsRef.dimmerWasClickedNotification = dimmerWasClickedNotification;

    function respondToOnClick() {
        setVisibility(false, true);
        dimmerWasClickedNotification.post({});
    }

    const backgroundDimmerTransition = useTransition(shouldBeVisible, null, {
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        immediate: !shouldAnimateVisibilityChange,
    });

    return <>
        {
            backgroundDimmerTransition.map(({ item, key, props }) => {
                if (item === false) { return undefined; }
                return <animated.div key={key} onClick={respondToOnClick} style={{
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    position: "fixed",
                    top: "0", left: "0", bottom: "0", right: "0",
                    zIndex: 10,
                    ...props,
                }} />
            })
        }
    </>
}


function MainSiteInterface() {

    return <div className="MainSiteInterface" style={{ marginTop: scssVariables.navBarHeightFromScreenTop }}>
        <NavBar />
        <Switch>
            {getAllSelections().map((x, i) => {
                const selectionInfo = getInfoForSelection(x);
                const path = selectionInfo.routePath;
                const isExact = selectionInfo.pageRouteHasSubRoutes === false;
                return <Route key={i} exact={isExact} path={path}
                    render={() => {
                        return <ComponentForSelection selection={x} />
                    }} />
            })}
            <Route path="*" component={NotFoundPage} />
        </Switch>
        <Footer />
    </div>
}


function ComponentForSelection(props: { selection: NavBarSelection }) {
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

    return <Component />
}



function Dashboard() {
    const dashboardInfo = useRef<DashboardInfo>({}).current;
    return <DashboardInfoContext.Provider value={dashboardInfo}>
        <div className="Dashboard">
            <Products/>
        </div>
    </DashboardInfoContext.Provider>
}


