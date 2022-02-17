import { matchPath } from "react-router-dom";
import * as RoutePaths from "topLevelRoutePaths";

export default function isValidContactUsRoute(route: string): boolean {
  return matchPath(route, { path: RoutePaths.CONTACT_US })?.isExact === true;
}
