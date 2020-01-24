
import React, { useRef } from 'react';

import { useLocation, Router } from 'react-router-dom';
import { createBrowserHistory, History } from 'history';
import Dashboard from './Dashboard/Dashboard';

import MainSiteInterface from './MainSiteInterface/MainSiteInterface';
import { isValidDashboardRoute } from './Dashboard/DashboardRoutesInfo';
import isValidMainSiteInterfaceRoute from './MainSiteInterface/MainSideInterfaceRoutesValidator';
import HeaderAndFooterContainer from 'random-components/HeaderAndFooterContainer/HeaderAndFooterContainer';
import NotFoundPage from 'random-components/NotFoundPage/NotFoundPage';
import AlertProvider, { useAlertFunctionality, CustomAlertInfo, CustomAlertButtonInfo, CustomAlertButtonType } from 'random-components/CustomAlert/CustomAlert';
import { ScreenDimmerProvider } from './ScreenDimmer';


export default function App() {
    //eslint-disable-next-line react/jsx-pascal-case
    return <AlertProvider><_App /></AlertProvider>
}

function _App() {
    const alertInfo = useAlertFunctionality();
    const historyObj = useRef<History>(createBrowserHistory({
        getUserConfirmation(message, callback) {
            
            let callBackHasBeenCalled = false;
            function callCallbackIfNeeded(decision: boolean){
                if (callBackHasBeenCalled === false){
                    callBackHasBeenCalled = true;
                    callback(decision);
                }
            }

            const yesButtonInfo: CustomAlertButtonInfo = {
                title: "Yes",
                action: dismiss => {
                    callCallbackIfNeeded(true);
                    dismiss();
                },
                type: CustomAlertButtonType.PRIMARY,
            };

            const cancelButtonInfo: CustomAlertButtonInfo = {
                title: "Cancel",
                action: dismiss => {
                    callCallbackIfNeeded(false);
                    dismiss();
                },
                type: CustomAlertButtonType.SECONDARY,
            };

            const info: CustomAlertInfo = {
                uniqueKey: "GET CONFIRMATION FOR HISTORY CHANGE",
                title: "Are you sure?",
                description: message,
                rightButtonInfo: yesButtonInfo,
                leftButtonInfo: cancelButtonInfo,
                onDismiss: () => callCallbackIfNeeded(false),
            };

            alertInfo.showAlert(info);
        },
    })).current;
    //eslint-disable-next-line react/jsx-pascal-case
    return <Router history={historyObj}><__App /></Router>
}

function __App() {

    const location = useLocation();

    return <ScreenDimmerProvider>
        <div className="App">
            {(() => {
                if (isValidDashboardRoute(location.pathname)) {
                    return <Dashboard />
                } else if (isValidMainSiteInterfaceRoute(location.pathname)) {
                    return <MainSiteInterface />
                } else {
                    return <HeaderAndFooterContainer>
                        <NotFoundPage />
                    </HeaderAndFooterContainer>
                }
            })()}
        </div>
    </ScreenDimmerProvider>

}


