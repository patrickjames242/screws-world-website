import { matchPath } from "react-router-dom";
import * as RoutePaths from "topLevelRoutePaths";

export default function isValidHomeRoute(route: string): boolean {
  return matchPath(route, { path: RoutePaths.HOME })?.isExact === true;
}
