

export enum SelectionType {
    Home,
    AboutUs,
    Services,
    Products,
    ContactUs,
}

const routePaths = {
    [SelectionType.Home]: '/',
    [SelectionType.AboutUs]: '/about-us',
    [SelectionType.Services]: '/services',
    [SelectionType.Products]: '/products',
    [SelectionType.ContactUs]: '/contact-us',
}

export function getAllSelections() {
    const s = SelectionType;
    return [s.Home, s.AboutUs, s.Services, s.Products, s.ContactUs];
};

export function getSelectionItemForRoutePath(routePath: string): SelectionType | null {
    return getAllSelections().filter(x => routePaths[x] === routePath)[0] ?? null;
}

export function getInfoForSelection(selection: SelectionType) {

    const textValue: string = (() => {
        switch (selection) {
            case SelectionType.Home: return 'home';
            case SelectionType.AboutUs: return 'about us';
            case SelectionType.Services: return 'services';
            case SelectionType.Products: return 'products';
            case SelectionType.ContactUs: return 'contact Us';
        }
    })();

    const routePath = routePaths[selection];

    return {
        routePath, textValue,
    }
}

