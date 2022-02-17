import { matchPath } from "react-router-dom";
import * as RoutePaths from "topLevelRoutePaths";

export default function isValidAboutUsRoute(route: string): boolean {
  return matchPath(route, { path: RoutePaths.ABOUT_US })?.isExact === true;
}
