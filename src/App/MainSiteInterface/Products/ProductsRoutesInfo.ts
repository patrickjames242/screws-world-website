// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { matchPath, match } from "react-router-dom";
import * as RoutePaths from "topLevelRoutePaths";
import { ProductsDataObjectID, ProductCategory } from "./ProductsDataHelpers";
import { Optional } from "jshelpers";

const dashboardBaseURL = RoutePaths.DASHBOARD;
const productsBaseURL = RoutePaths.PRODUCTS;

const editProductItemBaseURL = dashboardBaseURL + "/edit-product-item";

export const MainUIProductsRouteMatchPaths = {
  root: productsBaseURL,
  productDetailsView: productsBaseURL + "/:id",
};

export const MainUIProductsRouteURLs = {
  root: MainUIProductsRouteMatchPaths.root,
  productDetailsView(id: ProductsDataObjectID) {
    return productsBaseURL + "/" + id.stringVersion;
  },
};

export function isValidMainInterfaceProductsRoute(route: string): boolean {
  const match = matchPath<{ id?: string }>(route, {
    path: [
      MainUIProductsRouteMatchPaths.productDetailsView,
      MainUIProductsRouteMatchPaths.root,
    ],
  });
  return isMatchValid(match);
}

export const EDIT_PRODUCT_DEFAULT_PARENT_QUERY_PARAM_KEY = "default-parent";

export const DashboardProductsRouteMatchPaths = {
  root: dashboardBaseURL,
  productDetailsView: dashboardBaseURL + "/:id",
  createProductItem: dashboardBaseURL + "/create-product-item",
  editProductItem: editProductItemBaseURL + "/:id",
};

export const DashboardProductsRouteURLs = {
  root: DashboardProductsRouteMatchPaths.root,
  productDetailsView(id: ProductsDataObjectID) {
    return dashboardBaseURL + "/" + id.stringVersion;
  },
  createProductItem(defaultParentCategory?: Optional<ProductCategory>) {
    let url = DashboardProductsRouteMatchPaths.createProductItem;
    if (defaultParentCategory !== undefined) {
      url +=
        "?" +
        EDIT_PRODUCT_DEFAULT_PARENT_QUERY_PARAM_KEY +
        "=" +
        (defaultParentCategory?.id.databaseID ?? "null");
    }
    return url;
  },
  editProductItem(id: ProductsDataObjectID) {
    return editProductItemBaseURL + "/" + id.stringVersion;
  },
};

export function isValidDashboardProductsRoute(route: string): boolean {
  const match = matchPath<{ id?: string }>(route, {
    path: [
      DashboardProductsRouteMatchPaths.editProductItem,
      DashboardProductsRouteMatchPaths.createProductItem,
      DashboardProductsRouteMatchPaths.productDetailsView,
      DashboardProductsRouteMatchPaths.root,
    ],
  });
  return isMatchValid(match);
}

function isMatchValid(match: match<{ id?: string }> | null): boolean {
  if (!match?.isExact) {
    return false;
  }
  if (match?.params.id) {
    return ProductsDataObjectID.isValidObjectIDString(match?.params.id);
  } else {
    return true;
  }
}
