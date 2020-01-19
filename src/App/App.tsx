
import React, { useState, useRef } from 'react';

import { useLocation } from 'react-router-dom';
import { animated, useTransition } from 'react-spring';


import { ScreenDimmerFunctionsContext, ScreenDimmerFunctions } from './AppUIHelpers';
import { Notification } from 'jshelpers';
import Dashboard from './Dashboard/Dashboard';

import MainSiteInterface from './MainSiteInterface/MainSiteInterface';
import isValidDashboardRoute from './Dashboard/DashboardRoutesValidator';
import isValidMainSiteInterfaceRoute from './MainSiteInterface/MainSideInterfaceRoutesValidator';
import HeaderAndFooterContainer from 'random-components/HeaderAndFooterContainer/HeaderAndFooterContainer';
import NotFoundPage from 'random-components/NotFoundPage/NotFoundPage';
import AlertProvider from 'random-components/CustomAlert/CustomAlert';


export default function App() {

    const location = useLocation();
    
    const screenDimmerFunctionsRef = useRef<ScreenDimmerFunctions>({}).current;

    return <AlertProvider>
        <ScreenDimmerFunctionsContext.Provider value={screenDimmerFunctionsRef}>
            <div className="App">
                {(() => {
                    if (isValidDashboardRoute(location.pathname)){
                        return <Dashboard/>
                    } else if (isValidMainSiteInterfaceRoute(location.pathname)){
                        return <MainSiteInterface/>
                    } else {
                        return <HeaderAndFooterContainer>
                            <NotFoundPage/>
                        </HeaderAndFooterContainer>
                    }
                })()}
                <ScreenDimmer functionsRef={screenDimmerFunctionsRef} />
            </div>
        </ScreenDimmerFunctionsContext.Provider>
    </AlertProvider>
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


