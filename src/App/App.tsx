
import React, { useState, useEffect, useRef } from 'react';

import { Route, Switch } from 'react-router-dom';
import { animated, useTransition } from 'react-spring';

import scssVariables from '_helpers.scss';
import { SelectionType as NavBarSelection, getAllSelections, getInfoForSelection } from 'random-components/NavBar/SelectionType';
import NavBar  from 'random-components/NavBar/NavBar';
import Home from 'pages/Home/Home';
import AboutUs from 'pages/AboutUs/AboutUs';
import Services from 'pages/Services/Services';
import Products from 'pages/Products/Products';
import ContactUs from 'pages/ContactUs/ContactUs'

import Footer from 'random-components/Footer/Footer';
import NotFoundPage from 'random-components/NotFoundPage/NotFoundPage';

import { AppHelpersContext } from './AppUIHelpers';
import { Notification } from 'jshelpers';



export default function App() {

    const {appHelperProviderValue: screenDimmerAppHelperProviderValue, screenDimmerElement} = useScreenDimmerFunctionality();

    const appHelpersProviderValue = useRef({
        screenDimmer: screenDimmerAppHelperProviderValue,
    }).current;

    return <AppHelpersContext.Provider value={appHelpersProviderValue}>
        
        <div className="App" style={{ marginTop: scssVariables.navBarHeightFromScreenTop }}>
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
            {screenDimmerElement}
        </div>

    </AppHelpersContext.Provider>

}

function useScreenDimmerFunctionality(){

    const [shouldBeVisible, setVisibility] = useState(false);
    const shouldAnimateVisibilityChange = useRef(true);

    function setScreenDimmerVisibility(isVisible: boolean, animate: boolean){
        shouldAnimateVisibilityChange.current = animate;
        document.body.style.overflow = isVisible ? "hidden" : "initial";
        setVisibility(isVisible);
    }

    const screenDimmerDidDismissNotification = useRef(new Notification()).current;

    function respondToDimmerClicked(){
        setScreenDimmerVisibility(false, true);
        screenDimmerDidDismissNotification.post({});
    }

    const dimmerElement = <ScreenDimmer onClick={respondToDimmerClicked} shouldBeVisible={shouldBeVisible} shouldAnimateVisibilityChange={shouldAnimateVisibilityChange.current}/>;

    return {
        appHelperProviderValue: {
            setScreenDimmerVisibility, 
            screenDimmerDidDismissNotification,
        },
        screenDimmerElement: dimmerElement,
    }
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





function ScreenDimmer(props: { onClick: React.MouseEventHandler, shouldBeVisible: boolean, shouldAnimateVisibilityChange: boolean }) {

    const backgroundDimmerTransition = useTransition(props.shouldBeVisible, null, {
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        immediate: !props.shouldAnimateVisibilityChange,
    });

    const componentProps = props;

    return <>
        {
            backgroundDimmerTransition.map(({ item, key, props }) => {
                if (item === false) { return undefined; }
                return <animated.div key={key} onClick={componentProps.onClick} style={{
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


