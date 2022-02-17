import * as RoutePaths from "topLevelRoutePaths";

export enum SelectionType {
  Home,
  AboutUs,
  Services,
  Products,
  ContactUs,
}

const routePaths = {
  [SelectionType.Home]: RoutePaths.HOME,
  [SelectionType.AboutUs]: RoutePaths.ABOUT_US,
  [SelectionType.Services]: RoutePaths.SERVICES,
  [SelectionType.Products]: RoutePaths.PRODUCTS,
  [SelectionType.ContactUs]: RoutePaths.CONTACT_US,
};

export function getAllSelections() {
  const s = SelectionType;
  return [s.Home, s.AboutUs, s.Services, s.Products, s.ContactUs];
}

export function getInfoForSelection(selection: SelectionType) {
  const textValue: string = (() => {
    switch (selection) {
      case SelectionType.Home:
        return "home";
      case SelectionType.AboutUs:
        return "about us";
      case SelectionType.Services:
        return "services";
      case SelectionType.Products:
        return "products";
      case SelectionType.ContactUs:
        return "contact Us";
    }
  })();

  const routePath = routePaths[selection];

  return {
    routePath,
    textValue,
  };
}
