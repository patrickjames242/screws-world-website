import isValidAboutUsRoute from "./AboutUs/AboutUsRoutesValidator";
import isValidContactUsRoute from "./ContactUs/ContactUsRoutesValidator";
import isValidHomeRoute from "./Home/HomeRoutesValidator";
import isValidProductsRoute from "./Products/ProductsRoutesValidator";
import isValidServicesRoute from "./Services/ServicesRoutesValidator";


export default function isValidMainSiteInterfaceRoute(route: string): boolean{
    return [
        isValidAboutUsRoute(route),
        isValidContactUsRoute(route),
        isValidHomeRoute(route),
        isValidProductsRoute(route),
        isValidServicesRoute(route),
    ].some(x => x === true);
}