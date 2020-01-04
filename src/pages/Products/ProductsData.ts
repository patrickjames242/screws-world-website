
import { getIntegerArray, Optional } from "jshelpers";

export enum ProductDataType {
    Product,
    ProductCategory,
}

export interface ProductDataObject {
    readonly id: number,
    readonly name: string,
    readonly description: string,
    readonly dataType: ProductDataType,
}

export class Product implements ProductDataObject {

    readonly dataType: ProductDataType.Product = ProductDataType.Product;

    constructor(
        readonly id: number,
        readonly name: string,
        readonly description: string,
    ) { }
}



export class ProductCategory implements ProductDataObject {

    readonly dataType: ProductDataType.ProductCategory = ProductDataType.ProductCategory;

    constructor(
        readonly id: number,
        readonly name: string,
        readonly description: string,
        readonly children: ProductDataObject[] = [],
    ) { }
}

export function isProductCategory(x: any): x is ProductCategory{
    return !!x.children;
}




function getProductsDataTreeInfo(): [ProductDataObject[], {[itemIndex: number]: ProductDataObject}]{

    const names = [
        "Hex bolts", "Flange bolts", "Roofing screws", "Socket screws", "Set screws", "Nuts", "Washers", "Threaded inserts", "Elevator bolts", "Thumb screws"
    ];

    const descriptions = [
        "The most common type of bolt used in structural connections offering a larger diameter hex head.",
        // "A hexagonal head for use with a wrench. These bolts are sometimes called Frame bolts.",
        // "Screws with coarse threads and a pointed end for use in sheet metal sometimes also used in plastic, fiberglass, or wood.",
        // "Screws with coarse threads and a drill point end for use in thicker gauge steel.",

    ]

    const getRandomDecimal = (() => {

        let currentRandomDecimalIndex = -1;
        const randomDecimals = getIntegerArray(0, 20).map(x => x / 20);

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

    let nextAvailableID = 0;
    
    const itemsObject: {[itemIndex: number]: ProductDataObject} = {};

    const categories = getIntegerArray(1, 20).map(() => {
        const upper = Math.round(getRandomDecimal() * 15) + 3;
        const products = getIntegerArray(1, upper).map(() => {
            const newProduct = new Product(nextAvailableID++, getRandomName(), getRandomDescription());
            itemsObject[newProduct.id] = newProduct;
            return newProduct;
        });
        const newCategory = new ProductCategory(nextAvailableID++, getRandomName(), getRandomDescription(), products);
        itemsObject[newCategory.id] = newCategory;
        return newCategory;
    });
    return [categories, itemsObject];
}


const productsDataTreeInfo = getProductsDataTreeInfo();

export const productsDataTree = productsDataTreeInfo[0];
const productsDataObjectIds = productsDataTreeInfo[1];

export function getDataObjectForID(id: number): Optional<ProductDataObject>{
    return productsDataObjectIds[id] ?? null;
}