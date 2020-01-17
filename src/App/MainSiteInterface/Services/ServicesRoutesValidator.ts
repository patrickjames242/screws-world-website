import { matchPath } from "react-router-dom";
import * as RoutePaths from 'routePaths';

export default function isValidServicesRoute(route: string): boolean{
    return matchPath(route, {path: RoutePaths.SERVICES})?.isExact === true;
}