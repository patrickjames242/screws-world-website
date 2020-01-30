


import { Optional } from "jshelpers";
import image1 from './icons/screwProductImage1.jpg';
import image2 from './icons/screwProductImage2.jpg';
import image3 from './icons/screwProductImage3.jpg';
import { fetchAllCategories, fetchAllProducts, ProductItemNetworkResponse } from "API";


// PUBLIC STUFF


export enum ProductDataType {
    Product,
    ProductCategory,
}

export const ProductItemUniqueIDGenerator = Object.freeze({

    productText: "product",
    categoryText: "category",

    getForItem(item: ProductDataObject): string{
        return [
            (() => {
                switch (item.dataType){
                    case ProductDataType.Product: return ProductItemUniqueIDGenerator.productText;
                    case ProductDataType.ProductCategory: return ProductItemUniqueIDGenerator.categoryText;
                }
            })(),
            item.id,
        ].join("-");
    },

    regex: /^(product|category)-[0-9]+$/,

    isValidUniqueID(string: string): boolean{
        return ProductItemUniqueIDGenerator.regex.test(string);
    },

    parseFromString(string: string): Optional<[ProductDataType, number]>{
        if (ProductItemUniqueIDGenerator.isValidUniqueID(string) === false){return null;}
        const split = string.split("-");
        const dataType = (() => {
            switch(split[0]){
                case ProductItemUniqueIDGenerator.productText: return ProductDataType.Product;
                case ProductItemUniqueIDGenerator.categoryText: return ProductDataType.ProductCategory;
            }
            throw new Error("this point should not be reached. Check logic");
        })();
        const id = Number(split[1]);
        return [dataType, id];
    },

});

export abstract class ProductDataObject {
    
    protected _parent: Optional<ProductCategory> = null;
    abstract readonly dataType: ProductDataType;

    constructor(
        readonly id: number,
        readonly name: string,
        readonly description: Optional<string>,
        readonly imageURL: string,
    ){}

    get parent(): Optional<ProductCategory>{
        return this._parent;
    }

    get uniqueProductItemID(): string{
        return ProductItemUniqueIDGenerator.getForItem(this);
    }
}

export class Product extends ProductDataObject {

    readonly dataType: ProductDataType.Product = ProductDataType.Product;

}

export class ProductCategory extends ProductDataObject {

    readonly dataType: ProductDataType.ProductCategory = ProductDataType.ProductCategory;

    constructor(
        id: number,
        name: string,
        description: Optional<string>,
        imageURL: string,
        readonly children: ProductDataObject[] = [],
    ) {
        super(id, name, description, imageURL);
        this.children.forEach(x => (x as ProductCategory)._parent = this);
    }
}

export function isProduct(x: any): x is Product {
    if (!x || typeof x !== "object") { return false; }
    return x.dataType === ProductDataType.Product;
}

export function isProductCategory(x: any): x is ProductCategory {
    if (!x || typeof x !== "object") { return false; }
    return x.dataType === ProductDataType.ProductCategory;
}

// returns true if the item IS the category. works as expected otherwise
export function doesProductCategoryRecursivelyContainItem(item: ProductDataObject, category: ProductCategory): boolean {
    if (item.id === category.id) { return true; }
    if (item.parent != null) {
        return doesProductCategoryRecursivelyContainItem(item.parent, category);
    }
    return false;
}





export type ProductObjectsByUniqueID = {[itemIndex: string]: ProductDataObject};

export class ProductsDataFetchResult{
    constructor(
        readonly tree: ProductDataObject[],
        private readonly objectsByUniqueID: ProductObjectsByUniqueID,
    ){}

    getObjectForUniqueID(productsItemUniqueID: string): Optional<ProductDataObject>{
        return this.objectsByUniqueID[productsItemUniqueID] ?? null;
    }
}

export async function startFetchingProductsDataTree(): Promise<ProductsDataFetchResult> {
    return await _getProductsDataTreePromise();
}












// PRIVATE STUFF

async function _getProductsDataTreeInfo(): Promise<ProductsDataFetchResult> {
    const results = await Promise.all([fetchAllProducts(), fetchAllCategories()]);
    const products = (results[0] as ProductItemNetworkResponse[]);
    const categories = (results[1] as ProductItemNetworkResponse[]);
    return _parseProductsAndCategoriesNetworkData(categories, products);
}

function _sortProductDataObjectsByName(items: ProductDataObject[]): ProductDataObject[]{
    return items.sort((x1, x2) => x1.name.localeCompare(x2.name));
}

function _parseProductsAndCategoriesNetworkData(categories: ProductItemNetworkResponse[], products: ProductItemNetworkResponse[]): ProductsDataFetchResult{

    const itemsObject: { [itemIndex: string]: ProductDataObject } = {};

    const productsOrganizedByParentID: {[parentID: number]: Product[]} = [];

    let tree: ProductDataObject[] = [];
    
    for (const product of products){
        const item = new Product(product.id, product.title, product.description, _getRandomImageURL());
        if (product.parent_category){
            const prevArray = productsOrganizedByParentID[product.parent_category];
            if (prevArray){
                prevArray.push(item);
            } else {
                productsOrganizedByParentID[product.parent_category] = [item]; 
            }
        } else {
            tree.push(item);
            itemsObject[item.uniqueProductItemID] = item;
        }
    }

    for (const category of categories){
        const children = _sortProductDataObjectsByName((productsOrganizedByParentID[category.id] ?? []));
        const item = new ProductCategory(category.id, category.title, category.description, _getRandomImageURL(), children);
        tree.push(item);
        itemsObject[item.uniqueProductItemID] = item;
    }

    tree = _sortProductDataObjectsByName(tree);

    return new ProductsDataFetchResult(tree, itemsObject);
}


const _getRandomImageURL = (() => {
    const images = [image1, image2, image3];

    const getRandomDecimal = (() => {

        let currentRandomDecimalIndex = -1;
        const randomDecimals = [0.7, 0.1, 0.4, 0.6, 0.3, 0.9, 1, 0, 0.2, 0.5, 0.8];

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

    return () => getRandomElementFrom(images)!;
})();


let _productsDataTreePromise: Optional<Promise<ProductsDataFetchResult>> = null;



function _getProductsDataTreePromise(): Promise<ProductsDataFetchResult>{
    return _productsDataTreePromise ?? (_productsDataTreePromise = _getProductsDataTreeInfo());
}



