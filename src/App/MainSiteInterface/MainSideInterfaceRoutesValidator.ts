import isValidAboutUsRoute from "./AboutUs/AboutUsRoutesValidator";
import isValidContactUsRoute from "./ContactUs/ContactUsRoutesValidator";
import isValidHomeRoute from "./Home/HomeRoutesValidator";

import isValidServicesRoute from "./Services/ServicesRoutesValidator";
import { isValidMainInterfaceProductsRoute } from "./Products/ProductsRoutesInfo";


export default function isValidMainSiteInterfaceRoute(route: string): boolean{
    return [
        isValidAboutUsRoute(route),
        isValidContactUsRoute(route),
        isValidHomeRoute(route),
        isValidMainInterfaceProductsRoute(route),
        isValidServicesRoute(route),
    ].some(x => x === true);
}