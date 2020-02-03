


import { Optional } from "jshelpers";
import image1 from './icons/screwProductImage1.jpg';
import image2 from './icons/screwProductImage2.jpg';
import image3 from './icons/screwProductImage3.jpg';
import { fetchAllItems, ProductItemNetworkResponse, FetchItemType, APIChange, APIChangeType } from "API";


// PUBLIC STUFF


export enum ProductDataType {
    Product,
    ProductCategory,
}








export class ProductsDataObjectID {

    private static productText = "product";
    private static categoryText = "category";
    private static regex = /^(product|category)-[0-9]+$/;

    static parseFromString: (string: string) => Optional<ProductsDataObjectID> = (string: string) => {
        if (!ProductsDataObjectID.isValidObjectIDString(string)) { return null; }
        const split = string.split("-");
        const dataType = (() => {
            switch (split[0]) {
                case ProductsDataObjectID.productText: return ProductDataType.Product;
                case ProductsDataObjectID.categoryText: return ProductDataType.ProductCategory;
            }
            throw new Error("this point should not be reached. Check logic");
        })();
        const id = Number(split[1]);
        return new ProductsDataObjectID(id, dataType);
    }

    static isValidObjectIDString(string: string): boolean {
        return ProductsDataObjectID.regex.test(string);
    }

    constructor(
        readonly databaseID: number,
        readonly objectType: ProductDataType,
    ) { }

    stringVersion = (() => {
        const typeText = (() => {
            switch (this.objectType) {
                case ProductDataType.Product: return ProductsDataObjectID.productText;
                case ProductDataType.ProductCategory: return ProductsDataObjectID.categoryText;
            }
        })();
        return typeText + "-" + this.databaseID;
    })();

    isEqualTo: (otherID: ProductsDataObjectID) => boolean =
        (otherID: ProductsDataObjectID) => {
            return otherID.stringVersion === this.stringVersion;
        }

}

export abstract class ProductDataObject {

    readonly id: ProductsDataObjectID;

    protected _name: string;
    protected _description: Optional<string>;
    protected _imageURL: string;
    protected _parentGetter: (id: ProductsDataObjectID) => Optional<ProductCategory>;

    constructor(
        objectType: ProductDataType,
        databaseID: number,
        name: string,
        description: Optional<string>,
        imageURL: string,
        parentGetter: (id: ProductsDataObjectID) => Optional<ProductCategory>,
    ) {
        this.id = new ProductsDataObjectID(databaseID, objectType);
        this._name = name;
        this._description = description;
        this._imageURL = imageURL;
        this._parentGetter = parentGetter;
    }

    abstract getNewWithUpdatedProperties(props: { name: string, description: Optional<string> }): ProductDataObject;

    get name() { return this._name; }
    get description() { return this._description; }
    get imageURL() { return this._imageURL; }
    get parent() { return this._parentGetter(this.id); }

}

export class Product extends ProductDataObject {
    constructor(
        id: number,
        name: string,
        description: Optional<string>,
        imageURL: string,
        parentGetter: (id: ProductsDataObjectID) => Optional<ProductCategory>,
    ) {
        super(ProductDataType.Product, id, name, description, imageURL, parentGetter);
    }

    getNewWithUpdatedProperties(props: {name: string, description: Optional<string>}): Product{
        return new Product(this.id.databaseID, props.name, props.description, this.imageURL, this._parentGetter);
    }

}

export class ProductCategory extends ProductDataObject {

    private _childrenGetter: (categoryID: number) => ProductDataObject[];

    constructor(
        id: number,
        name: string,
        description: Optional<string>,
        imageURL: string,
        parentGetter: (id: ProductsDataObjectID) => Optional<ProductCategory>,
        childrenGetter: (categoryID: number) => ProductDataObject[],
    ) {
        super(ProductDataType.ProductCategory, id, name, description, imageURL, parentGetter);
        this._childrenGetter = childrenGetter;
    }

    get children(): ProductDataObject[] {
        return this._childrenGetter(this.id.databaseID) ?? [];
    }

    getNewWithUpdatedProperties(props: {name: string, description: Optional<string>}): ProductCategory{
        return new ProductCategory(this.id.databaseID, props.name, props.description, this.imageURL, this._parentGetter, this._childrenGetter);
    }
}



export class ProductsDataObjectsManager {

    private static _categoryIDForObjectsWithNoCategory = new ProductsDataObjectID(-1, ProductDataType.ProductCategory);

    private constructor(
        // objects that don't have a parent are stored as an array in this map with the databaseID for the above id as the key
        private readonly _categoryChildrenByCategoryID: Map<number, ProductDataObject[]>,
        private readonly _objectParentsByObjectID: Map<string, Optional<number>>,
        private readonly _objectsByObjectIDs: Map<string, ProductDataObject>,
    ) { }


    static getFor(
        networkCategoriesResponse: ProductItemNetworkResponse[],
        networkProductsResponse: ProductItemNetworkResponse[],
    ): ProductsDataObjectsManager {

        const _categoryChildrenByCategoryID = new Map<number, ProductDataObject[]>();
        const _objectParentsByObjectID = new Map<string, Optional<number>>();
        const _objectsByObjectIDs = new Map<string, ProductDataObject>();

        const manager = new ProductsDataObjectsManager(_categoryChildrenByCategoryID, _objectParentsByObjectID, _objectsByObjectIDs);

        networkCategoriesResponse.forEach(x => {
            const category = new ProductCategory(x.id, x.title, x.description, _getRandomImageURL(), manager._getObjectParentForObjectWithID, manager._getCategoryChildenForCategoryID);
            _objectsByObjectIDs.set(category.id.stringVersion, category);
        });
        networkProductsResponse.forEach(x => {
            const product = new Product(x.id, x.title, x.description, _getRandomImageURL(), manager._getObjectParentForObjectWithID);
            _objectsByObjectIDs.set(product.id.stringVersion, product);
        });

        const objectByIdsMapValues = _objectsByObjectIDs.values();

        [...networkCategoriesResponse, ...networkProductsResponse].forEach(x => {
            const convertedObject = objectByIdsMapValues.next().value as ProductDataObject;
            _objectParentsByObjectID.set(convertedObject.id.stringVersion, x.parent_category);
            const categoryIDForParentChildrenArray = x.parent_category ?? ProductsDataObjectsManager._categoryIDForObjectsWithNoCategory.databaseID;
            let previousParentChildrenArray = _categoryChildrenByCategoryID.get(categoryIDForParentChildrenArray) ?? [];
            _categoryChildrenByCategoryID.set(categoryIDForParentChildrenArray, [...previousParentChildrenArray, convertedObject]);
        });

        for (const [key, value] of _categoryChildrenByCategoryID.entries()) {
            _categoryChildrenByCategoryID.set(key, ProductsDataObjectsManager._sortObjects(value));
        }

        return manager;
    }



    getCopy: () => ProductsDataObjectsManager = () => {
        return new ProductsDataObjectsManager(this._categoryChildrenByCategoryID, this._objectParentsByObjectID, this._objectsByObjectIDs);
    }

    getTopLevelItems: () => ProductDataObject[] = () => {
        return this._categoryChildrenByCategoryID.get(ProductsDataObjectsManager._categoryIDForObjectsWithNoCategory.databaseID) ?? [];
    }

    getObjectForObjectID: (objectID: ProductsDataObjectID) => Optional<ProductDataObject> =
        (objectID: ProductsDataObjectID) => {
            return this._objectsByObjectIDs.get(objectID.stringVersion) ?? null;
        }

    private _getObjectParentForObjectWithID: (objectID: ProductsDataObjectID) => Optional<ProductCategory> =
        (objectID: ProductsDataObjectID) => {
            const categoryID = this._objectParentsByObjectID.get(objectID.stringVersion) ?? null;
            if (!categoryID){return null;}
            const id = new ProductsDataObjectID(categoryID, ProductDataType.ProductCategory);
            return (this._objectsByObjectIDs.get(id.stringVersion) ?? null) as Optional<ProductCategory>;
        }

    private _getCategoryChildenForCategoryID: (categoryID: number) => ProductDataObject[] =
        (categoryID: number) => {
            return this._categoryChildrenByCategoryID.get(categoryID) ?? [];
        }

    updateAccordingToAPIChange: (change: APIChange) => void =
        (change: APIChange) => {
            const networkResponse = change.info;
            const itemType = _getProductsDataTypeFromAPIItemType(change.itemType);
            switch (change.type) {
                case APIChangeType.INSERTION:
                    if (typeof networkResponse === "number") { break; }

                    const convertedNetworkReponse = (() => {
                        switch (itemType) {
                            case ProductDataType.Product:
                                return new Product(networkResponse.id, networkResponse.title, networkResponse?.description, _getRandomImageURL(), this._getObjectParentForObjectWithID);
                            case ProductDataType.ProductCategory:
                                return new ProductCategory(networkResponse.id, networkResponse.title, networkResponse.description, _getRandomImageURL(), this._getObjectParentForObjectWithID, this._getCategoryChildenForCategoryID);
                        }
                    })();

                    this._objectsByObjectIDs.set(convertedNetworkReponse.id.stringVersion, convertedNetworkReponse);
                    this._resetParentAndChildrenInformationForChild(convertedNetworkReponse, networkResponse.parent_category);
                    break;

                case APIChangeType.UPDATE:
                    if (typeof networkResponse === "number") { break; }
                    const existingObject1 = this._objectsByObjectIDs.get((new ProductsDataObjectID(networkResponse.id, itemType)).stringVersion);
                    if (!existingObject1) { break; }
                    const updatedObject = existingObject1.getNewWithUpdatedProperties({name: networkResponse.title, description: networkResponse.description});
                    this._objectsByObjectIDs.set(existingObject1.id.stringVersion, updatedObject);
                    this._resetParentAndChildrenInformationForChild(updatedObject, networkResponse.parent_category);
                    break;

                case APIChangeType.DELETE:
                    if (typeof networkResponse !== "number") { break; }
                    const existingObject2 = this._objectsByObjectIDs.get(new ProductsDataObjectID(networkResponse, itemType).stringVersion);
                    if (!existingObject2) { break; }
                    this._deleteParentAndChildrenInformationAboutChild(existingObject2);
                    this._objectsByObjectIDs.delete(existingObject2.id.stringVersion);
                    break;
            }
        }

    private _resetParentAndChildrenInformationForChild(child: ProductDataObject, categoryID: Optional<number>) {

        this._deleteParentAndChildrenInformationAboutChild(child);

        this._objectParentsByObjectID.set(child.id.stringVersion, categoryID);

        const categoryIDForChildrenArray = categoryID ?? ProductsDataObjectsManager._categoryIDForObjectsWithNoCategory.databaseID;

        let previousChildrenArray = this._categoryChildrenByCategoryID.get(categoryIDForChildrenArray);
        if (previousChildrenArray) {
            previousChildrenArray.push(child);
            previousChildrenArray = ProductsDataObjectsManager._sortObjects(previousChildrenArray);
            this._categoryChildrenByCategoryID.set(categoryIDForChildrenArray, previousChildrenArray);
        } else {
            this._categoryChildrenByCategoryID.set(categoryIDForChildrenArray, [child]);
        }
    }

    private _deleteParentAndChildrenInformationAboutChild(child: ProductDataObject) {
        const parentCategoryID = (() => {
            return this._objectParentsByObjectID.get(child.id.stringVersion) ?? ProductsDataObjectsManager._categoryIDForObjectsWithNoCategory.databaseID;
        })();
        this._objectParentsByObjectID.set(child.id.stringVersion, null);

        let childrenArray = this._categoryChildrenByCategoryID.get(parentCategoryID);
        if (!childrenArray) { return; }
        childrenArray = childrenArray.filter(x => x.id.isEqualTo(child.id) === false);
        this._categoryChildrenByCategoryID.set(parentCategoryID, childrenArray);
    }



    private static _sortObjects(objects: ProductDataObject[]): ProductDataObject[] {
        return objects.sort((x1, x2) => x1.name.localeCompare(x2.name));
    }


}




export function isProduct(x: any): x is Product {
    if (!x || typeof x !== "object") { return false; }
    return x.id.objectType === ProductDataType.Product
}

export function isProductCategory(x: any): x is ProductCategory {
    if (!x || typeof x !== "object") { return false; }
    return x.id.objectType === ProductDataType.ProductCategory;
}

// returns true if the item IS the category. works as expected otherwise
export function doesProductCategoryRecursivelyContainItem(item: ProductDataObject, category: ProductCategory): boolean {
    if (item.id === category.id) { return true; }
    if (item.parent != null) {
        return doesProductCategoryRecursivelyContainItem(item.parent, category);
    }
    return false;
}




export async function startFetchingProductsDataTree(): Promise<ProductsDataObjectsManager> {
    return await _getProductsDataTreePromise();
}



























// PRIVATE STUFF

function _getProductsDataTypeFromAPIItemType(itemType: FetchItemType): ProductDataType {
    switch (itemType) {
        case FetchItemType.CATEGORY: return ProductDataType.ProductCategory;
        case FetchItemType.PRODUCT: return ProductDataType.Product;
    }
}

async function _getProductsDataTreeInfo(): Promise<ProductsDataObjectsManager> {
    const results = await Promise.all([fetchAllItems(FetchItemType.PRODUCT), fetchAllItems(FetchItemType.CATEGORY)]);
    const products = (results[0] as ProductItemNetworkResponse[]);
    const categories = (results[1] as ProductItemNetworkResponse[]);
    return ProductsDataObjectsManager.getFor(categories, products);
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

let _productsDataTreePromise: Optional<Promise<ProductsDataObjectsManager>> = null;

function _getProductsDataTreePromise(): Promise<ProductsDataObjectsManager> {
    return _productsDataTreePromise ?? (_productsDataTreePromise = _getProductsDataTreeInfo());
}


