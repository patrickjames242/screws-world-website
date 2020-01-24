
import React, { useRef, useState } from "react";
import { DashboardInfo, DashboardInfoContext } from "App/AppUIHelpers";
import './Dashboard.scss';

import { useSetTitleFunctionality } from "jshelpers";
import Products from "App/MainSiteInterface/Products/Products";
import { useHistory, Switch, Route, useRouteMatch } from "react-router-dom";
import * as RoutePaths from 'topLevelRoutePaths';

import LogInScreen from "./LogInScreen/LogInScreen";

import { DashboardRouteURLs } from './DashboardRoutesInfo';



const UserLoggedInPersistedState = {
    key: "isUserLoggedIn",
    get(): boolean {
        return (localStorage.getItem(UserLoggedInPersistedState.key) ?? "0") === "1";
    },
    set(newValue: boolean) {
        localStorage.setItem(UserLoggedInPersistedState.key, newValue === true ? "1" : "0");
    }
}


export default function Dashboard() {

    useSetTitleFunctionality("Dashboard");

    const history = useHistory();

    const [isUserLoggedIn, setUserLoggedInState] = useState(UserLoggedInPersistedState.get());

    const pageToRedirectToAfterLoginKey = "pageToRedirectToAfterLogin";

    function setIsUserLoggedIn(newValue: boolean) {
        const redirectURL = (() => {
            if (history.location.state && history.location.state[pageToRedirectToAfterLoginKey]) {
                return history.location.state[pageToRedirectToAfterLoginKey];
            }
            return RoutePaths.DASHBOARD;
        })();
        UserLoggedInPersistedState.set(newValue);
        if (newValue) {
            history.replace(redirectURL)
        } else {
            history.push(DashboardRouteURLs.dashboardLogIn);
        }
        setUserLoggedInState(newValue);
    }

    const dashboardRouteMatch = useRouteMatch(RoutePaths.DASHBOARD);
    const dashboardLoginRouteMatch = useRouteMatch(DashboardRouteURLs.dashboardLogIn);


    if (dashboardRouteMatch) {
        if (dashboardLoginRouteMatch?.isExact === true && isUserLoggedIn) {
            history.replace(RoutePaths.DASHBOARD);
        } else if (history.location.pathname !== DashboardRouteURLs.dashboardLogIn &&
            isUserLoggedIn === false) {
            history.replace(DashboardRouteURLs.dashboardLogIn,
                { [pageToRedirectToAfterLoginKey]: history.location.pathname });
        }
    }

    const dashboardInfo = useRef<DashboardInfo>({
        logOut: () => {
            setIsUserLoggedIn(false);
        }
    }).current;

    function handleAuthToken(authToken: string) {
        setIsUserLoggedIn(true);
    }


    return <DashboardInfoContext.Provider value={dashboardInfo}>
        <div className="Dashboard">
            <Switch>
                <Route exact path={DashboardRouteURLs.dashboardLogIn}>
                    <LogInScreen authTokenHandler={handleAuthToken} />
                </Route>
                <Route path="*" component={Products} />
            </Switch>
        </div>
    </DashboardInfoContext.Provider>
}





