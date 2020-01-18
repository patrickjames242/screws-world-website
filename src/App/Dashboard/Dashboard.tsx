
import React, { useRef, useState, useEffect } from "react";
import { DashboardInfo, DashboardInfoContext } from "App/AppUIHelpers";
import './Dashboard.scss';

import { useSetTitleFunctionality } from "jshelpers";
import Products from "App/MainSiteInterface/Products/Products";
import { useHistory, Switch, Route, useRouteMatch } from "react-router-dom";
import * as RoutePaths from 'routePaths';

import LogInScreen from "./LogInScreen/LogInScreen";





const UserLoggedInPersistedState = {
    key: "isUserLoggedIn",
    get(): boolean{
        return (localStorage.getItem(UserLoggedInPersistedState.key) ?? "0") === "1";
    },
    set(newValue: boolean){
        localStorage.setItem(UserLoggedInPersistedState.key, newValue === true ? "1" : "0");
    }
}

export default function Dashboard() {
    
    useSetTitleFunctionality("Dashboard");

    const history = useHistory();

    const [isUserLoggedIn, setUserLoggedInState] = useState(UserLoggedInPersistedState.get());

    const pageToRedirectToAfterLoginKey = "pageToRedirectToAfterLogin";

    function setIsUserLoggedIn(newValue: boolean){
        const redirectURL = (() => {
            if (history.location.state && history.location.state[pageToRedirectToAfterLoginKey]){
                return history.location.state[pageToRedirectToAfterLoginKey];
            }
            return RoutePaths.DASHBOARD;
        })();
        UserLoggedInPersistedState.set(newValue);
        if (newValue){
            history.replace(redirectURL)
        } else {
            history.push(RoutePaths.DASHBOARD_LOGIN);
        }
        setUserLoggedInState(newValue);
    }

    const dashboardRouteMatch = useRouteMatch(RoutePaths.DASHBOARD);
    const dashboardLoginRouteMatch = useRouteMatch(RoutePaths.DASHBOARD_LOGIN);

    if (dashboardRouteMatch){
        if (dashboardLoginRouteMatch?.isExact === true && isUserLoggedIn){
            history.replace(RoutePaths.DASHBOARD);    
        } else if (history.location.pathname !== RoutePaths.DASHBOARD_LOGIN && 
            isUserLoggedIn === false) {
            history.replace(RoutePaths.DASHBOARD_LOGIN, 
                    {[pageToRedirectToAfterLoginKey]: history.location.pathname})
        }
    }

    const dashboardInfo = useRef<DashboardInfo>({logOut: () => {
        setIsUserLoggedIn(false);
    }}).current;

    function handleAuthToken(authToken: string){
        setIsUserLoggedIn(true);
    }

    return <DashboardInfoContext.Provider value={dashboardInfo}>
        <div className="Dashboard">
            <Switch>
                <Route exact path={RoutePaths.DASHBOARD_LOGIN}>
                    <LogInScreen authTokenHandler={handleAuthToken}/>
                </Route>
                <Route path="*" component={Products}/>
            </Switch>
        </div>
    </DashboardInfoContext.Provider>
}





