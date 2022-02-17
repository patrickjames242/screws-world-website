import { Optional } from "jshelpers";

import {
  fetchAllItems,
  ProductItemNetworkResponse,
  FetchItemType,
  APIChange,
  APIChangeType,
  ProductImageContentFitMode,
  ProductItemContentFitMode_Helpers,
} from "API";

// PUBLIC STUFF

export enum ProductDataType {
  Product,
  ProductCategory,
}

export class ProductsDataObjectID {
  private static productText = "product";
  private static categoryText = "category";
  private static regex = /^(product|category)-[0-9]+$/;

  static parseFromString: (string: string) => Optional<ProductsDataObjectID> = (
    string: string
  ) => {
    if (!ProductsDataObjectID.isValidObjectIDString(string)) {
      return null;
    }
    const split = string.split("-");
    const dataType = (() => {
      switch (split[0]) {
        case ProductsDataObjectID.productText:
          return ProductDataType.Product;
        case ProductsDataObjectID.categoryText:
          return ProductDataType.ProductCategory;
      }
      throw new Error("this point should not be reached. Check logic");
    })();
    const id = Number(split[1]);
    return new ProductsDataObjectID(id, dataType);
  };

  static isValidObjectIDString(string: string): boolean {
    return ProductsDataObjectID.regex.test(string);
  }

  constructor(
    readonly databaseID: number,
    readonly objectType: ProductDataType
  ) {}

  stringVersion = (() => {
    const typeText = (() => {
      switch (this.objectType) {
        case ProductDataType.Product:
          return ProductsDataObjectID.productText;
        case ProductDataType.ProductCategory:
          return ProductsDataObjectID.categoryText;
      }
    })();
    return typeText + "-" + this.databaseID;
  })();

  isEqualTo: (otherID: ProductsDataObjectID) => boolean = (
    otherID: ProductsDataObjectID
  ) => {
    return otherID.stringVersion === this.stringVersion;
  };
}

export abstract class ProductDataObject {
  readonly id: ProductsDataObjectID;

  protected _name: string;
  protected _description: Optional<string>;
  protected _imageURL: Optional<string>;
  protected _imageContentFitMode: ProductImageContentFitMode;

  protected _parentGetter: (
    id: ProductsDataObjectID
  ) => Optional<ProductCategory>;

  constructor(
    objectType: ProductDataType,
    databaseID: number,
    name: string,
    description: Optional<string>,
    imageURL: Optional<string>,
    imageContentFitMode: ProductImageContentFitMode,
    parentGetter: (id: ProductsDataObjectID) => Optional<ProductCategory>
  ) {
    this.id = new ProductsDataObjectID(databaseID, objectType);
    this._name = name;
    this._description = description;
    this._imageURL = imageURL;
    this._imageContentFitMode = imageContentFitMode;
    this._parentGetter = parentGetter;
  }

  abstract getNewWithUpdatedProperties(props: {
    name: string;
    description: Optional<string>;
    imageURL: Optional<string>;
    imageContentFitMode: ProductImageContentFitMode;
  }): ProductDataObject;

  get name() {
    return this._name;
  }
  get description() {
    return this._description;
  }
  get imageURL() {
    return this._imageURL;
  }
  get imageContentFitMode() {
    return this._imageContentFitMode;
  }
  get parent() {
    return this._parentGetter(this.id);
  }
}

export class Product extends ProductDataObject {
  constructor(
    id: number,
    name: string,
    description: Optional<string>,
    imageURL: Optional<string>,
    imageContentFitMode: ProductImageContentFitMode,
    parentGetter: (id: ProductsDataObjectID) => Optional<ProductCategory>
  ) {
    super(
      ProductDataType.Product,
      id,
      name,
      description,
      imageURL,
      imageContentFitMode,
      parentGetter
    );
  }

  getNewWithUpdatedProperties(props: {
    name: string;
    description: Optional<string>;
    imageURL: Optional<string>;
    imageContentFitMode: ProductImageContentFitMode;
  }): Product {
    return new Product(
      this.id.databaseID,
      props.name,
      props.description,
      props.imageURL,
      props.imageContentFitMode,
      this._parentGetter
    );
  }
}

export class ProductCategory extends ProductDataObject {
  private _childrenGetter: (categoryID: number) => ProductDataObject[];

  constructor(
    id: number,
    name: string,
    description: Optional<string>,
    imageURL: Optional<string>,
    imageContentFitMode: ProductImageContentFitMode,
    parentGetter: (id: ProductsDataObjectID) => Optional<ProductCategory>,
    childrenGetter: (categoryID: number) => ProductDataObject[]
  ) {
    super(
      ProductDataType.ProductCategory,
      id,
      name,
      description,
      imageURL,
      imageContentFitMode,
      parentGetter
    );
    this._childrenGetter = childrenGetter;
  }

  get children(): ProductDataObject[] {
    return this._childrenGetter(this.id.databaseID) ?? [];
  }

  getNewWithUpdatedProperties(props: {
    name: string;
    description: Optional<string>;
    imageURL: Optional<string>;
    imageContentFitMode: ProductImageContentFitMode;
  }): ProductCategory {
    return new ProductCategory(
      this.id.databaseID,
      props.name,
      props.description,
      props.imageURL,
      props.imageContentFitMode,
      this._parentGetter,
      this._childrenGetter
    );
  }
}

export class ProductsDataObjectsManager {
  private static _categoryIDForObjectsWithNoCategory = new ProductsDataObjectID(
    -1,
    ProductDataType.ProductCategory
  );

  // look, the reason we maintain all these maps is because this data is being requested at every render of our app. For example, having to find all the children for a particular category at every render is going to negatively impact performance when the amount of categories and products start growing.

  private constructor(
    // objects that don't have a parent are stored as an array in this map with the databaseID for the above id as the key
    private readonly _categoryChildrenByCategoryID: Map<
      number,
      ProductDataObject[]
    >,
    private readonly _objectParentsByObjectID: Map<string, Optional<number>>,
    private readonly _objectsByObjectIDs: Map<string, ProductDataObject>,

    // any cached values are recalculated from scratch after any api chnages. If is null, it means either the value hasn't been calculated yet, or the value has been cleared and needs to be recalculated
    private _cachedCategories: Optional<ProductCategory[]>
  ) {
    if (_cachedCategories == null) {
      this._invalidateCache();
    }
  }

  static getFor(
    networkCategoriesResponse: ProductItemNetworkResponse[],
    networkProductsResponse: ProductItemNetworkResponse[]
  ): ProductsDataObjectsManager {
    const _categoryChildrenByCategoryID = new Map<
      number,
      ProductDataObject[]
    >();
    const _objectParentsByObjectID = new Map<string, Optional<number>>();
    const _objectsByObjectIDs = new Map<string, ProductDataObject>();

    const manager = new ProductsDataObjectsManager(
      _categoryChildrenByCategoryID,
      _objectParentsByObjectID,
      _objectsByObjectIDs,
      null
    );

    networkCategoriesResponse.forEach((x) => {
      const imageContentFitMode =
        ProductItemContentFitMode_Helpers.getFromString(
          x.image_content_fit_mode
        );
      const category = new ProductCategory(
        x.id,
        x.title,
        x.description,
        x.image_url,
        imageContentFitMode,
        manager._getObjectParentForObjectWithID,
        manager._getCategoryChildenForCategoryID
      );
      _objectsByObjectIDs.set(category.id.stringVersion, category);
    });

    networkProductsResponse.forEach((x) => {
      const imageContentFitMode =
        ProductItemContentFitMode_Helpers.getFromString(
          x.image_content_fit_mode
        );
      const product = new Product(
        x.id,
        x.title,
        x.description,
        x.image_url,
        imageContentFitMode,
        manager._getObjectParentForObjectWithID
      );
      _objectsByObjectIDs.set(product.id.stringVersion, product);
    });

    const objectByIdsMapValues = _objectsByObjectIDs.values();

    [...networkCategoriesResponse, ...networkProductsResponse].forEach((x) => {
      const convertedObject = objectByIdsMapValues.next()
        .value as ProductDataObject;
      _objectParentsByObjectID.set(
        convertedObject.id.stringVersion,
        x.parent_category
      );
      const categoryIDForParentChildrenArray =
        x.parent_category ??
        ProductsDataObjectsManager._categoryIDForObjectsWithNoCategory
          .databaseID;
      const previousParentChildrenArray =
        _categoryChildrenByCategoryID.get(categoryIDForParentChildrenArray) ??
        [];
      previousParentChildrenArray.push(convertedObject);
      _categoryChildrenByCategoryID.set(
        categoryIDForParentChildrenArray,
        previousParentChildrenArray
      );
    });

    for (const [key, value] of _categoryChildrenByCategoryID.entries()) {
      _categoryChildrenByCategoryID.set(
        key,
        ProductsDataObjectsManager._sortObjects(value)
      );
    }

    manager._invalidateCache();
    return manager;
  }

  getCopy: () => ProductsDataObjectsManager = () => {
    return new ProductsDataObjectsManager(
      this._categoryChildrenByCategoryID,
      this._objectParentsByObjectID,
      this._objectsByObjectIDs,
      this._cachedCategories
    );
  };

  // the array returned is sorted by name
  getTopLevelItems: () => ProductDataObject[] = () => {
    return (
      this._categoryChildrenByCategoryID.get(
        ProductsDataObjectsManager._categoryIDForObjectsWithNoCategory
          .databaseID
      ) ?? []
    );
  };

  getAllCategories: () => ProductCategory[] = () => {
    const val = (() => {
      if (this._cachedCategories != null) {
        return this._cachedCategories;
      } else {
        this._invalidateCache();
        const cachedCategories = this._cachedCategories;
        if (cachedCategories == null) {
          throw new Error("this shouldn't be null! Check logic!!");
        }
        return cachedCategories;
      }
    })();
    return val;
  };

  getObjectForObjectID: (
    objectID: ProductsDataObjectID
  ) => Optional<ProductDataObject> = (objectID: ProductsDataObjectID) => {
    return this._objectsByObjectIDs.get(objectID.stringVersion) ?? null;
  };

  private _getObjectParentForObjectWithID: (
    objectID: ProductsDataObjectID
  ) => Optional<ProductCategory> = (objectID: ProductsDataObjectID) => {
    const categoryID =
      this._objectParentsByObjectID.get(objectID.stringVersion) ?? null;
    if (categoryID == null) {
      return null;
    }
    const id = new ProductsDataObjectID(
      categoryID,
      ProductDataType.ProductCategory
    );
    return (this._objectsByObjectIDs.get(id.stringVersion) ??
      null) as Optional<ProductCategory>;
  };

  // the returned array is sorted by name
  private _getCategoryChildenForCategoryID: (
    categoryID: number
  ) => ProductDataObject[] = (categoryID: number) => {
    return this._categoryChildrenByCategoryID.get(categoryID) ?? [];
  };

  // instead of recalculating the keys and values of all of our maps from scratch every time a change occurs, we simply make the appropriate changes to the existing maps for performance reasons
  updateAccordingToAPIChange: (change: APIChange) => void = (
    change: APIChange
  ) => {
    const networkResponse = change.info;
    const itemType = _getProductsDataTypeFromAPIItemType(change.itemType);
    switch (change.type) {
      case APIChangeType.INSERTION:
        if (typeof networkResponse === "number") {
          break;
        }

        const convertedNetworkReponse = (() => {
          switch (itemType) {
            case ProductDataType.Product:
              const imageContentFitMode =
                ProductItemContentFitMode_Helpers.getFromString(
                  networkResponse.image_content_fit_mode
                );

              return new Product(
                networkResponse.id,
                networkResponse.title,
                networkResponse.description,
                networkResponse.image_url,
                imageContentFitMode,
                this._getObjectParentForObjectWithID
              );

            case ProductDataType.ProductCategory:
              const imageContentFitMode1 =
                ProductItemContentFitMode_Helpers.getFromString(
                  networkResponse.image_content_fit_mode
                );

              return new ProductCategory(
                networkResponse.id,
                networkResponse.title,
                networkResponse.description,
                networkResponse.image_url,
                imageContentFitMode1,
                this._getObjectParentForObjectWithID,
                this._getCategoryChildenForCategoryID
              );
            default:
              throw new Error(
                "this point should not be reached!! Check logic!!"
              );
          }
        })();

        this._objectsByObjectIDs.set(
          convertedNetworkReponse.id.stringVersion,
          convertedNetworkReponse
        );
        this._resetParentAndChildrenInformationForChild(
          convertedNetworkReponse,
          networkResponse.parent_category
        );
        break;

      case APIChangeType.UPDATE:
        if (typeof networkResponse === "number") {
          break;
        }
        const existingObject1 = this._objectsByObjectIDs.get(
          new ProductsDataObjectID(networkResponse.id, itemType).stringVersion
        );

        if (existingObject1 == null) {
          break;
        }

        const imageContentFitMode =
          ProductItemContentFitMode_Helpers.getFromString(
            networkResponse.image_content_fit_mode
          );

        const updatedObject = existingObject1.getNewWithUpdatedProperties({
          name: networkResponse.title,
          description: networkResponse.description,
          imageURL: networkResponse.image_url,
          imageContentFitMode: imageContentFitMode,
        });
        this._objectsByObjectIDs.set(
          existingObject1.id.stringVersion,
          updatedObject
        );

        this._resetParentAndChildrenInformationForChild(
          updatedObject,
          networkResponse.parent_category
        );
        break;

      case APIChangeType.DELETE:
        if (typeof networkResponse !== "number") {
          break;
        }
        const existingObject2 = this._objectsByObjectIDs.get(
          new ProductsDataObjectID(networkResponse, itemType).stringVersion
        );
        if (existingObject2 == null) {
          break;
        }
        this._recursivelyDeleteObjectAndChildren(existingObject2);
        break;
    }
    this._invalidateCache();
  };

  private _recursivelyDeleteObjectAndChildren(object: ProductDataObject) {
    if (isProductCategory(object) && object.children.length > 0) {
      for (const child of object.children) {
        this._recursivelyDeleteObjectAndChildren(child);
      }
    }
    this._deleteParentAndChildrenInformationAboutChild(object);
    this._objectsByObjectIDs.delete(object.id.stringVersion);
  }

  private _resetParentAndChildrenInformationForChild(
    child: ProductDataObject,
    categoryID: Optional<number>
  ) {
    this._deleteParentAndChildrenInformationAboutChild(child);

    this._objectParentsByObjectID.set(child.id.stringVersion, categoryID);

    const categoryIDForChildrenArray =
      categoryID ??
      ProductsDataObjectsManager._categoryIDForObjectsWithNoCategory.databaseID;

    let previousChildrenArray = this._categoryChildrenByCategoryID.get(
      categoryIDForChildrenArray
    );
    if (previousChildrenArray != null) {
      previousChildrenArray.push(child);
      previousChildrenArray = ProductsDataObjectsManager._sortObjects(
        previousChildrenArray
      );
      this._categoryChildrenByCategoryID.set(
        categoryIDForChildrenArray,
        previousChildrenArray
      );
    } else {
      this._categoryChildrenByCategoryID.set(categoryIDForChildrenArray, [
        child,
      ]);
    }
  }

  // removes the reference to the parent category of the object from the object to parent map, removes the object from the children array of its parent in the category to children map

  private _deleteParentAndChildrenInformationAboutChild(
    child: ProductDataObject
  ) {
    const parentCategoryID = (() => {
      return (
        this._objectParentsByObjectID.get(child.id.stringVersion) ??
        ProductsDataObjectsManager._categoryIDForObjectsWithNoCategory
          .databaseID
      );
    })();
    this._objectParentsByObjectID.set(child.id.stringVersion, null);

    let childrenArray =
      this._categoryChildrenByCategoryID.get(parentCategoryID);
    if (childrenArray == null) {
      return;
    }
    childrenArray = childrenArray.filter(
      (x) => x.id.isEqualTo(child.id) === false
    );
    this._categoryChildrenByCategoryID.set(parentCategoryID, childrenArray);
  }

  // recalculates any cached values... right now this only includes _cachedCategories
  private _invalidateCache() {
    let newCategories: ProductCategory[] = [];
    for (const object of this._objectsByObjectIDs.values()) {
      if (isProductCategory(object)) {
        newCategories.push(object);
      }
    }
    newCategories = ProductsDataObjectsManager._sortObjects(
      newCategories
    ) as ProductCategory[];
    this._cachedCategories = newCategories;
  }

  private static _sortObjects(
    objects: ProductDataObject[]
  ): ProductDataObject[] {
    return objects.sort((x1, x2) => x1.name.localeCompare(x2.name));
  }
}

export function isProduct(x: any): x is Product {
  if (!x || typeof x !== "object") {
    return false;
  }
  if (x.id && x.id.objectType !== undefined) {
    return (x.id.objectType as ProductDataType) === ProductDataType.Product;
  }
  return false;
}

export function isProductCategory(x: any): x is ProductCategory {
  if (!x || typeof x !== "object") {
    return false;
  }
  if (x.id && x.id.objectType !== undefined) {
    return (
      (x.id.objectType as ProductDataType) === ProductDataType.ProductCategory
    );
  }
  return false;
}

// returns true if the item IS the category. works as expected otherwise
export function doesProductCategoryRecursivelyContainItem(
  item: ProductDataObject,
  category: ProductCategory
): boolean {
  if (item.id === category.id) {
    return true;
  }
  if (item.parent != null) {
    return doesProductCategoryRecursivelyContainItem(item.parent, category);
  }
  return false;
}

export async function startFetchingProductsDataTree(): Promise<ProductsDataObjectsManager> {
  return await _getProductsDataTreePromise();
}

// PRIVATE STUFF

function _getProductsDataTypeFromAPIItemType(
  itemType: FetchItemType
): ProductDataType {
  switch (itemType) {
    case FetchItemType.CATEGORY:
      return ProductDataType.ProductCategory;
    case FetchItemType.PRODUCT:
      return ProductDataType.Product;
  }
}

async function _getProductsDataTreeInfo(): Promise<ProductsDataObjectsManager> {
  const results = await Promise.all([
    fetchAllItems(FetchItemType.PRODUCT),
    fetchAllItems(FetchItemType.CATEGORY),
  ]);
  const products = results[0] as ProductItemNetworkResponse[];
  const categories = results[1] as ProductItemNetworkResponse[];
  return ProductsDataObjectsManager.getFor(categories, products);
}

let _productsDataTreePromise: Optional<Promise<ProductsDataObjectsManager>> =
  null;

function _getProductsDataTreePromise(): Promise<ProductsDataObjectsManager> {
  return (
    _productsDataTreePromise ??
    (_productsDataTreePromise = _getProductsDataTreeInfo())
  );
}
