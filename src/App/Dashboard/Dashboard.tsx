import { RequestsRequiringAuthentication } from "API";
import Products from "App/MainSiteInterface/Products/Products";
import {
  allHistoryBlocksShouldBeRemoved,
  Optional,
  useSetTitleFunctionality,
} from "jshelpers";
import React, { useRef, useState } from "react";
import { Route, Switch, useHistory, useRouteMatch } from "react-router-dom";
import * as RoutePaths from "topLevelRoutePaths";
import "./Dashboard.scss";
import { DashboardRouteURLs } from "./DashboardRoutesInfo";
import { DashboardInfo, DashboardInfoContext } from "./DashboardUIHelpers";
import LogInScreen from "./LogInScreen/LogInScreen";

const UserPersistedAuthToken = (() => {
  const key = "userAuthToken";

  return {
    get(): Optional<string> {
      return localStorage.getItem(key) ?? null;
    },
    set(newValue: Optional<string>) {
      if (newValue != null) {
        localStorage.setItem(key, newValue);
      } else {
        localStorage.removeItem(key);
      }
    },
  };
})();

export default function Dashboard() {
  useSetTitleFunctionality("Dashboard");

  const history = useHistory<any>();

  const [isUserLoggedIn, setUserLoggedInState] = useState(
    !!UserPersistedAuthToken.get()
  );

  const dashboardInfo = useRef<DashboardInfo>({
    logOut: () => {
      setAuthToken(null);
    },
    requestsRequiringAuth: new RequestsRequiringAuthentication(
      UserPersistedAuthToken.get
    ),
  }).current;

  const pageToRedirectToAfterLoginKey = "pageToRedirectToAfterLogin";

  function setAuthToken(newValue: Optional<string>) {
    const redirectURL = (() => {
      if (
        history.location.state &&
        history.location.state[pageToRedirectToAfterLoginKey]
      ) {
        return history.location.state[pageToRedirectToAfterLoginKey];
      }
      return RoutePaths.DASHBOARD;
    })();

    UserPersistedAuthToken.set(newValue);

    if (newValue) {
      history.replace(redirectURL);
    } else {
      allHistoryBlocksShouldBeRemoved.post({});
      history.push(DashboardRouteURLs.dashboardLogIn);
    }
    setUserLoggedInState(!!newValue);
  }

  const dashboardRouteMatch = useRouteMatch(RoutePaths.DASHBOARD);
  const dashboardLoginRouteMatch = useRouteMatch(
    DashboardRouteURLs.dashboardLogIn
  );

  if (dashboardRouteMatch) {
    if (dashboardLoginRouteMatch?.isExact === true && isUserLoggedIn) {
      history.replace(RoutePaths.DASHBOARD);
    } else if (
      history.location.pathname !== DashboardRouteURLs.dashboardLogIn &&
      isUserLoggedIn === false
    ) {
      history.replace(DashboardRouteURLs.dashboardLogIn, {
        [pageToRedirectToAfterLoginKey]: history.location.pathname,
      });
    }
  }

  function handleAuthToken(authToken: string) {
    setAuthToken(authToken);
  }

  return (
    <DashboardInfoContext.Provider value={dashboardInfo}>
      <div className="Dashboard">
        <Switch>
          <Route exact path={DashboardRouteURLs.dashboardLogIn}>
            <LogInScreen authTokenHandler={handleAuthToken} />
          </Route>
          <Route path="*" component={Products} />
        </Switch>
      </div>
    </DashboardInfoContext.Provider>
  );
}
