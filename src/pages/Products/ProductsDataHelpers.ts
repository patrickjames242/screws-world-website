


import { getIntegerArray, Optional } from "jshelpers";
import image1 from './icons/screwProductImage1.jpg';
import image2 from './icons/screwProductImage2.jpg';
import image3 from './icons/screwProductImage3.jpg';

export enum ProductDataType {
    Product,
    ProductCategory,
}

export interface ProductDataObject {
    readonly id: number,
    readonly name: string,
    readonly description: string,
    readonly dataType: ProductDataType,
    readonly imageURL: string,
    parent: Optional<ProductCategory>,
}

export class Product implements ProductDataObject {

    readonly dataType: ProductDataType.Product = ProductDataType.Product;
    parent: Optional<ProductCategory> = null;

    constructor(
        readonly id: number,
        readonly name: string,
        readonly description: string,
        readonly imageURL: string,
    ) { }
}

export class ProductCategory implements ProductDataObject {

    readonly dataType: ProductDataType.ProductCategory = ProductDataType.ProductCategory;
    parent: Optional<ProductCategory> = null;

    constructor(
        readonly id: number,
        readonly name: string,
        readonly description: string,
        readonly children: ProductDataObject[] = [],
        readonly imageURL: string,
    ) {
        this.children.forEach(x => {
            x.parent = this;
        })
    }
}

export function isProduct(x: any): x is Product {
    if (!x || typeof x !== "object"){return false;}
    return x.dataType === ProductDataType.Product;
}

export function isProductCategory(x: any): x is ProductCategory {
    if (!x || typeof x !== "object"){return false;}
    
    return x.dataType === ProductDataType.ProductCategory;
}

// returns true if the item IS the category. works as expected otherwise
export function doesProductCategoryRecursivelyContainItem(item: ProductDataObject, category: ProductCategory): boolean {
    if (item.id === category.id) { return true; }
    if (item.parent != null){
        return doesProductCategoryRecursivelyContainItem(item.parent, category);
    }
    return false;
}


function getProductsDataTreeInfo(): [ProductDataObject[], { [itemIndex: number]: ProductDataObject }] {

    const names = [
        "Hex bolts", "Flange bolts", "Roofing screws", "Socket screws", "Set screws", "Nuts", "Washers", "Threaded inserts", "Elevator bolts", "Thumb screws"
    ];

    const descriptions = [
        "The most common type of bolt used in structural connections offering a larger diameter hex head.",
        "A hexagonal head for use with a wrench. These bolts are sometimes called Frame bolts.",
        "Screws with coarse threads and a pointed end for use in sheet metal sometimes also used in plastic, fiberglass, or wood.",
        "Screws with coarse threads and a drill point end for use in thicker gauge steel.",
    ];

    const images = [image1, image2, image3];

    const getRandomDecimal = (() => {

        let currentRandomDecimalIndex = -1;
        const randomDecimals = [0.7, 0.1, 0.4, 0.6, 0.3, 0.9, 1, 0, 0.2, 0.5, 0.25, 0.57, 0.43, 0.22, 0.1, 0.87, 0.81, 0.65, 0.45, 0.35, 0.95];

        return () => {
            currentRandomDecimalIndex = (currentRandomDecimalIndex + 1) % randomDecimals.length
            const selectedDecimal = randomDecimals[currentRandomDecimalIndex];
            return selectedDecimal;
        }
    })();

    function getRandomElementFrom<Element>(array: Element[]): Optional<Element> {
        if (array.length <= 0) { return null; }
        const randomIndex = Math.round((array.length - 1) * getRandomDecimal());
        return array[randomIndex];
    }

    const getRandomName = () => getRandomElementFrom(names)!;
    const getRandomDescription = () => getRandomElementFrom(descriptions)!;
    const getRandomImage = () => getRandomElementFrom(images)!;

    let nextAvailableID = 0;

    const itemsObject: { [itemIndex: number]: ProductDataObject } = {};

    const categories = getIntegerArray(1, 20).map(() => {

        const subCategories = getIntegerArray(1, 5).map(() => {
            const upper = Math.round(getRandomDecimal() * 15) + 3;
            const products = getIntegerArray(1, upper).map(() => {
                const newProduct = new Product(nextAvailableID++, getRandomName(), getRandomDescription(), getRandomImage());
                itemsObject[newProduct.id] = newProduct;
                return newProduct;
            });
            const newCategory = new ProductCategory(nextAvailableID++, getRandomName(), getRandomDescription(), products, getRandomImage());
            itemsObject[newCategory.id] = newCategory;
            return newCategory;
        });
        const newCategory = new ProductCategory(nextAvailableID++, getRandomName(), getRandomDescription(), subCategories, getRandomImage());
        itemsObject[newCategory.id] = newCategory;
        return newCategory;
    });
    return [categories, itemsObject];
}


const productsDataTreeInfo = getProductsDataTreeInfo();

export const productsDataTree = productsDataTreeInfo[0];
const productsDataObjectIds = productsDataTreeInfo[1];

export function getDataObjectForID(id: number): Optional<ProductDataObject> {
    return productsDataObjectIds[id] ?? null;
}

