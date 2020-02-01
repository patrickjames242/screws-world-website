


import { Optional, callIfPossible } from "jshelpers";
import image1 from './icons/screwProductImage1.jpg';
import image2 from './icons/screwProductImage2.jpg';
import image3 from './icons/screwProductImage3.jpg';
import { fetchAllItems, ProductItemNetworkResponse, FetchItemType, APIChange, APIChangeType } from "API";


// PUBLIC STUFF


export enum ProductDataType {
    Product,
    ProductCategory,
}



export const ProductItemUniqueIDGenerator = Object.freeze({

    productText: "product",
    categoryText: "category",

    getForItem(item: ProductDataObject): string {
        return ProductItemUniqueIDGenerator.getFor(item.dataType, item.id);
    },

    getFor(itemType: ProductDataType, id: number) {
        return [
            (() => {
                switch (itemType) {
                    case ProductDataType.Product: return ProductItemUniqueIDGenerator.productText;
                    case ProductDataType.ProductCategory: return ProductItemUniqueIDGenerator.categoryText;
                }
            })(),
            id,
        ].join("-");
    },

    regex: /^(product|category)-[0-9]+$/,

    isValidUniqueID(string: string): boolean {
        return ProductItemUniqueIDGenerator.regex.test(string);
    },

    parseFromString(string: string): Optional<[ProductDataType, number]> {
        if (ProductItemUniqueIDGenerator.isValidUniqueID(string) === false) { return null; }
        const split = string.split("-");
        const dataType = (() => {
            switch (split[0]) {
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
    protected _name: string;
    protected _description: Optional<string>;
    protected _imageURL: string;
    abstract readonly dataType: ProductDataType;

    constructor(
        readonly id: number,
        name: string,
        description: Optional<string>,
        imageURL: string,
    ) {
        this._name = name;
        this._description = description;
        this._imageURL = imageURL;
    }

    updateProperties(props: { name: string, description: Optional<string> }) {
        this._name = props.name;
        this._description = props.description;
    }


    get parent() { return this._parent; }
    get name() { return this._name; }
    get description() { return this._description; }
    get imageURL() { return this._imageURL; }


    get uniqueProductItemID(): string {
        return ProductItemUniqueIDGenerator.getForItem(this);
    }
}

export class Product extends ProductDataObject {

    readonly dataType: ProductDataType.Product = ProductDataType.Product;

}



export class ProductCategory extends ProductDataObject {

    readonly dataType: ProductDataType.ProductCategory = ProductDataType.ProductCategory;

    private _children: ProductDataObject[];

    constructor(
        id: number,
        name: string,
        description: Optional<string>,
        imageURL: string,
        children: ProductDataObject[] = [],
    ) {
        super(id, name, description, imageURL);
        this._children = children;
        // cast as a category because it allows us to access the _parent attribute
        children.forEach(x => (x as ProductCategory)._parent = this);
        this.resortChildren();
    }

    get children() {
        return [...this._children];
    }

    private resortChildren() {
        this._children = _sortProductDataObjectsByName(this.children);
    }

    addChild = (newChild: ProductDataObject) => {
        if (this._children.some(x => x.uniqueProductItemID === newChild.uniqueProductItemID)) { return; }
        this._children.push(newChild);
        // cast as a category because it allows us to access the _parent attribute
        (newChild as ProductCategory)._parent = this;
        this.resortChildren();
    }

    removeChild = (child: ProductDataObject) => {
        if (this._children.some(x => x.uniqueProductItemID === child.uniqueProductItemID) === false) { return; }
        // cast as a category because it allows us to access the _parent attribute
        if ((child as ProductCategory)._parent !== this) {
            (child as ProductCategory)._parent = null;
        }
        this._children = this._children.filter(x => x.uniqueProductItemID !== child.uniqueProductItemID);
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





export type ProductObjectsByUniqueID = { [itemIndex: string]: ProductDataObject };

export class ProductsDataFetchResult {

    private _tree: ProductDataObject[];

    constructor(
        tree: ProductDataObject[],
        private readonly objectsByUniqueID: ProductObjectsByUniqueID,
    ) {
        this._tree = tree;
        this.resortTree();
    }

    get tree() {
        return this._tree;
    }

    private resortTree = () => {
        this._tree = _sortProductDataObjectsByName(this.tree);
    }

    getObjectForUniqueID = (productsItemUniqueID: string) => {
        return this.objectsByUniqueID[productsItemUniqueID] ?? null;
    }

    updateWithAPIChange = (change: APIChange) => {
        const productDataType = _getProductsDataTypeFromAPIItemType(change.itemType);
        switch (change.type) {
            case APIChangeType.INSERTION:
                if (!change.info || typeof change.info === "number") { break; }
                this.respondToInsertion(productDataType, change.info);

            case APIChangeType.UPDATE:
                if (!change.info || typeof change.info === "number") { break; }
                this.respondToUpdate(productDataType, change.info);

            case APIChangeType.DELETE:
                if (typeof change.info !== "number") { break; }
                this.respondToDeletion(productDataType, change.info);
        }
    }

    private respondToInsertion(itemType: ProductDataType, networkReponseObject: ProductItemNetworkResponse) {

        const productDataObject = (() => {
            const _class = (() => {
                switch (itemType) {
                    case ProductDataType.Product: return Product;
                    case ProductDataType.ProductCategory: return ProductCategory;
                }
            })();
            return new _class(networkReponseObject.id, networkReponseObject.title, networkReponseObject.description, _getRandomImageURL());
        })();

        this.objectsByUniqueID[productDataObject.uniqueProductItemID] = productDataObject;

        if (networkReponseObject.parent_category) {
            const categoryUniqueID = ProductItemUniqueIDGenerator.getFor(ProductDataType.ProductCategory, networkReponseObject.parent_category);
            const category = this.objectsByUniqueID[categoryUniqueID] as ProductCategory;
            if (!category) { return; }
            category.addChild(productDataObject);
        } else {
            this._tree.push(productDataObject);
            this.resortTree();
        }
    }

    private respondToUpdate(itemType: ProductDataType, networkReponseObject: ProductItemNetworkResponse) {
        const uniqueID = ProductItemUniqueIDGenerator.getFor(itemType, networkReponseObject.id);
        const object = this.objectsByUniqueID[uniqueID];
        object.updateProperties({ name: networkReponseObject.title, description: networkReponseObject.description });
        if ((object.parent?.id ?? null) === networkReponseObject.parent_category) { return; }
        callIfPossible(object.parent?.removeChild, object);
        if (!networkReponseObject.parent_category) { return; }
        const newParentCategoryUniqueID = ProductItemUniqueIDGenerator.getFor(ProductDataType.ProductCategory, networkReponseObject.parent_category);
        const newCategoryObject = this.objectsByUniqueID[newParentCategoryUniqueID] as ProductCategory;
        if (!newCategoryObject) { return; }
        newCategoryObject.addChild(object);
    }



    private respondToDeletion(itemType: ProductDataType, itemID: number) {
        const uniqueID = ProductItemUniqueIDGenerator.getFor(itemType, itemID);
        const deletedObject = this.objectsByUniqueID[uniqueID];
        if (!deletedObject) { return; }
        if (deletedObject.parent) {
            deletedObject.parent.removeChild(deletedObject);
        }
        this._tree = this._tree.filter(x => x.uniqueProductItemID !== deletedObject.uniqueProductItemID);
        delete this.objectsByUniqueID[uniqueID];
    }


    getCopy = () => {
        return new ProductsDataFetchResult(this.tree, this.objectsByUniqueID);
    }
}

export async function startFetchingProductsDataTree(): Promise<ProductsDataFetchResult> {
    return await _getProductsDataTreePromise();
}












// PRIVATE STUFF

function _getProductsDataTypeFromAPIItemType(itemType: FetchItemType): ProductDataType {
    switch (itemType) {
        case FetchItemType.CATEGORY: return ProductDataType.ProductCategory;
        case FetchItemType.PRODUCT: return ProductDataType.Product;
    }
}

async function _getProductsDataTreeInfo(): Promise<ProductsDataFetchResult> {
    const results = await Promise.all([fetchAllItems(FetchItemType.PRODUCT), fetchAllItems(FetchItemType.CATEGORY)]);
    const products = (results[0] as ProductItemNetworkResponse[]);
    const categories = (results[1] as ProductItemNetworkResponse[]);
    return _parseProductsAndCategoriesNetworkData(categories, products);
}

function _sortProductDataObjectsByName(items: ProductDataObject[]): ProductDataObject[] {
    return items.sort((x1, x2) => x1.name.localeCompare(x2.name));
}

function _parseProductsAndCategoriesNetworkData(categories: ProductItemNetworkResponse[], products: ProductItemNetworkResponse[]): ProductsDataFetchResult {

    const itemsObject: { [itemIndex: string]: ProductDataObject } = {};

    const productsOrganizedByParentID: { [parentID: number]: Product[] } = [];

    let tree: ProductDataObject[] = [];

    for (const product of products) {
        const item = new Product(product.id, product.title, product.description, _getRandomImageURL());
        itemsObject[item.uniqueProductItemID] = item;
        if (product.parent_category) {
            const prevArray = productsOrganizedByParentID[product.parent_category];
            if (prevArray) {
                prevArray.push(item);
            } else {
                productsOrganizedByParentID[product.parent_category] = [item];
            }
        } else {
            tree.push(item);
        }
    }

    for (const category of categories) {
        const children = productsOrganizedByParentID[category.id] ?? [];
        const item = new ProductCategory(category.id, category.title, category.description, _getRandomImageURL(), children);
        tree.push(item);
        itemsObject[item.uniqueProductItemID] = item;
    }

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



function _getProductsDataTreePromise(): Promise<ProductsDataFetchResult> {
    return _productsDataTreePromise ?? (_productsDataTreePromise = _getProductsDataTreeInfo());
}



















class ProductsDataObjectID {

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

abstract class _ProductDataObject {

    readonly id: ProductsDataObjectID;

    protected _name: string;
    protected _description: Optional<string>;
    protected _imageURL: string;
    protected _parentGetter: (id: ProductsDataObjectID) => Optional<_ProductCategory>;

    constructor(
        objectType: ProductDataType,
        databaseID: number,
        name: string,
        description: Optional<string>,
        imageURL: string,
        parentGetter: (id: ProductsDataObjectID) => Optional<_ProductCategory>,
    ) {
        this.id = new ProductsDataObjectID(databaseID, objectType);
        this._name = name;
        this._description = description;
        this._imageURL = imageURL;
        this._parentGetter = parentGetter;
    }

    updateProperties(props: { name: string, description: Optional<string> }) {
        this._name = props.name;
        this._description = props.description;
    }

    get name() { return this._name; }
    get description() { return this._description; }
    get imageURL() { return this._imageURL; }
    get parent() { return this._parentGetter(this.id); }

}

class _Product extends _ProductDataObject {
    constructor(
        id: number,
        name: string,
        description: Optional<string>,
        imageURL: string,
        parentGetter: (id: ProductsDataObjectID) => Optional<_ProductCategory>,
    ) {
        super(ProductDataType.Product, id, name, description, imageURL, parentGetter);
    }
}

class _ProductCategory extends _ProductDataObject {

    private _childrenGetter: (categoryID: number) => _ProductDataObject[];

    constructor(
        id: number,
        name: string,
        description: Optional<string>,
        imageURL: string,
        parentGetter: (id: ProductsDataObjectID) => Optional<_ProductCategory>,
        childrenGetter: (categoryID: number) => _ProductDataObject[],
    ) {
        super(ProductDataType.ProductCategory, id, name, description, imageURL, parentGetter);
        this._childrenGetter = childrenGetter;
    }

    get children() {
        return this._childrenGetter(this.id.databaseID);
    }

}

class ProductsDataObjectsManager {

    private static _categoryIDForObjectsWithNoCategory = new ProductsDataObjectID(-1, ProductDataType.ProductCategory);

    // objects that don't have a parent are stored as an array in this map with the databaseID for the above id as the key
    private readonly _categoryChildrenByCategoryID = new Map<number, _ProductDataObject[]>();
    private readonly _objectParentsByObjectID = new Map<string, Optional<_ProductCategory>>();
    private readonly _objectsByObjectIDs = new Map<string, _ProductDataObject>();

    constructor(
        networkCategoriesResponse: ProductItemNetworkResponse[],
        networkProductsResponse: ProductItemNetworkResponse[],
    ) {
        networkCategoriesResponse.forEach(x => {
            const category = new _ProductCategory(x.id, x.title, x.description, _getRandomImageURL(), this._getObjectParentForObjectWithID, this._getCategoryChildenForCategoryID);
            this._objectsByObjectIDs.set(category.id.stringVersion, category);
        });
        networkProductsResponse.forEach(x => {
            const product = new _Product(x.id, x.title, x.description, _getRandomImageURL(), this._getObjectParentForObjectWithID);
            this._objectsByObjectIDs.set(product.id.stringVersion, product);
        });

        const objectByIdsMapValues = this._objectsByObjectIDs.values();

        [...networkCategoriesResponse, ...networkProductsResponse].forEach(x => {
            const convertedObject = objectByIdsMapValues.next().value as _ProductDataObject;

            const parentCategory: Optional<_ProductCategory> = (() => {
                if (!x.parent_category) { return null; }
                const id = new ProductsDataObjectID(x.parent_category, ProductDataType.ProductCategory);
                return (this._objectsByObjectIDs.get(id.stringVersion) ?? null) as Optional<_ProductCategory>;
            })();

            this._objectParentsByObjectID.set(convertedObject.id.stringVersion, parentCategory);

            const categoryChildrenArray = (() => {
                const categoryID = parentCategory?.id.databaseID ?? ProductsDataObjectsManager._categoryIDForObjectsWithNoCategory.databaseID;
                const array = this._categoryChildrenByCategoryID.get(categoryID);
                if (array) {
                    return array
                } else {
                    const newArray: _ProductDataObject[] = [];
                    this._categoryChildrenByCategoryID.set(categoryID, newArray);
                    return newArray;
                }
            })();

            categoryChildrenArray.push(convertedObject);
        });

        for (const [key, value] of this._categoryChildrenByCategoryID.entries()){
            this._categoryChildrenByCategoryID.set(key, ProductsDataObjectsManager._sortObjects(value));
        }
    }

    getObjectForObjectID: (objectID: ProductsDataObjectID) => Optional<_ProductDataObject> =
        (objectID: ProductsDataObjectID) => {
            return this._objectsByObjectIDs.get(objectID.stringVersion) ?? null;
        }

    private _getObjectParentForObjectWithID: (objectID: ProductsDataObjectID) => Optional<_ProductCategory> =
        (objectID: ProductsDataObjectID) => {
            return this._objectParentsByObjectID.get(objectID.stringVersion) ?? null;
        }

    private _getCategoryChildenForCategoryID: (categoryID: number) => _ProductDataObject[] =
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
                                return new _Product(networkResponse.id, networkResponse.title, networkResponse?.description, _getRandomImageURL(), this._getObjectParentForObjectWithID);
                            case ProductDataType.ProductCategory:
                                return new _ProductCategory(networkResponse.id, networkResponse.title, networkResponse.description, _getRandomImageURL(), this._getObjectParentForObjectWithID, this._getCategoryChildenForCategoryID);
                        }
                    })();

                    this._objectsByObjectIDs.set(convertedNetworkReponse.id.stringVersion, convertedNetworkReponse);
                    this._resetParentAndChildrenInformationForChild(convertedNetworkReponse, networkResponse.parent_category);
                    break;

                case APIChangeType.UPDATE:
                    if (typeof networkResponse === "number") { break; }
                    const existingObject1 = this._objectsByObjectIDs.get((new ProductsDataObjectID(networkResponse.id, itemType)).stringVersion);
                    if (!existingObject1) { break; }
                    existingObject1.updateProperties({ name: networkResponse.title, description: networkResponse.description });
                    this._resetParentAndChildrenInformationForChild(existingObject1, networkResponse.id);
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

    private _resetParentAndChildrenInformationForChild(child: _ProductDataObject, categoryID: Optional<number>) {

        this._deleteParentAndChildrenInformationAboutChild(child);

        const newCategory = (() => {
            if (!categoryID) { return null; }
            const id = new ProductsDataObjectID(categoryID, ProductDataType.ProductCategory);
            return (this._objectsByObjectIDs.get(id.stringVersion) ?? null) as Optional<_ProductCategory>;
        })();

        this._objectParentsByObjectID.set(child.id.stringVersion, newCategory);

        const categoryIDForChildrenArray = newCategory?.id.databaseID ?? ProductsDataObjectsManager._categoryIDForObjectsWithNoCategory.databaseID;

        let previousChildrenArray = this._categoryChildrenByCategoryID.get(categoryIDForChildrenArray);
        if (!previousChildrenArray) { return; }
        previousChildrenArray.push(child);
        previousChildrenArray = ProductsDataObjectsManager._sortObjects(previousChildrenArray);
        this._categoryChildrenByCategoryID.set(categoryIDForChildrenArray, previousChildrenArray);
    }

    private _deleteParentAndChildrenInformationAboutChild(child: _ProductDataObject) {
        const parentCategoryID = (() => {
            return (this._objectParentsByObjectID.get(child.id.stringVersion)?.id ?? ProductsDataObjectsManager._categoryIDForObjectsWithNoCategory).databaseID;
        })();

        let childrenArray = this._categoryChildrenByCategoryID.get(parentCategoryID);
        if (!childrenArray) { return; }

        childrenArray = childrenArray.filter(x => x.id.isEqualTo(child.id) === false);
        this._categoryChildrenByCategoryID.set(parentCategoryID, childrenArray);
        this._objectParentsByObjectID.set(child.id.stringVersion, null);
    }



    private static _sortObjects(objects: _ProductDataObject[]): _ProductDataObject[] {
        return objects.sort((x1, x2) => x1.name.localeCompare(x2.name));
    }


}