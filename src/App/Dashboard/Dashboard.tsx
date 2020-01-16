
import React, { useRef, useState } from "react";
import { DashboardInfo, DashboardInfoContext } from "App/AppUIHelpers";
import './Dashboard.scss';
import CustomTextField from 'random-components/CustomTextField/CustomTextField';
import { useSetTitleFunctionality } from "jshelpers";
import Products from "App/MainSiteInterface/Products/Products";
import { useHistory, Switch, Route, useRouteMatch } from "react-router-dom";
import * as RoutePaths from 'routePaths';


const isUserLoggedInKey = "isUserLoggedIn";

function getIsUserLoggedInStorage(): boolean{
    return (localStorage.getItem(isUserLoggedInKey) ?? "0") === "1";
}

function setIsUserLoggedInStorage(newValue: boolean){
    localStorage.setItem(isUserLoggedInKey, newValue === true ? "1" : "0");
}



export default function Dashboard() {
    
    useSetTitleFunctionality("Dashboard");

    const history = useHistory();

    const [isUserLoggedIn, setUserLoggedInState] = useState(getIsUserLoggedInStorage());

    const pageToRedirectToAfterLoginKey = "pageToRedirectToAfterLogin";

    function setIsUserLoggedIn(newValue: boolean){
        const redirectURL = (() => {
            if (history.location.state && history.location.state[pageToRedirectToAfterLoginKey]){
                return history.location.state[pageToRedirectToAfterLoginKey];
            }
            return RoutePaths.DASHBOARD;
        })();
        setIsUserLoggedInStorage(newValue);
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

    
    function respondToLoginButtonClick(){
        setIsUserLoggedIn(true);
    }

    const dashboardInfo = useRef<DashboardInfo>({logOut: () => {
        setIsUserLoggedIn(false);
    }}).current;

    return <DashboardInfoContext.Provider value={dashboardInfo}>
        <div className="Dashboard">
            <Switch>
                <Route exact path={RoutePaths.DASHBOARD_LOGIN}>
                    <LogInScreen onLogInButtonClick={respondToLoginButtonClick}/>
                </Route>
                <Route path="*" component={Products}/>
            </Switch>
        </div>
    </DashboardInfoContext.Provider>
}


function LogInScreen(props: {onLogInButtonClick: () => void}){
    return <div className="LogInScreen">
        <div className="vertically-centered-content">
            <div className="horizontally-centered-content">
                <div className="title">Log In</div>
                <CustomTextField placeholderText="Enter your passcode"/>
                <button className="login-button" onClick={props.onLogInButtonClick}>Log In</button>
            </div>
        </div>        
    </div>
}

