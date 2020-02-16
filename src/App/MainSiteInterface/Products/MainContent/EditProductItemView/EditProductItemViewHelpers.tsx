

import { ProductItemProps, FetchItemType } from "API";
import { isProduct, ProductDataType, isProductCategory, ProductDataObject } from "../../ProductsDataHelpers";
import { Optional } from "jshelpers";
import {Location} from 'history';
import * as QueryString from 'query-string';
import { EDIT_PRODUCT_DEFAULT_PARENT_QUERY_PARAM_KEY } from "../../ProductsRoutesInfo";

export interface EditProductItemViewProps {
    itemToEdit: Optional<ProductDataObject>,
}


export const FieldTitles = {
    itemType: "Item Type",
    title: "Title",
    description: "Description",
    parentCategory: "Parent Category",
    image: "Image",
}




// undefined means no value should be pushed to server. null means current value in server database should be deleted.
export type OptionalDatabaseValue<Type> = Type | null | undefined;
export type RequiredDatabaseValue<Type> = Type | undefined;

export interface StateProps {
    itemType: RequiredDatabaseValue<ProductDataType>,
    parentCategoryID: OptionalDatabaseValue<number>,
    title: RequiredDatabaseValue<string>,
    description: OptionalDatabaseValue<string>,
    imageFile: OptionalDatabaseValue<File>,
}

function getDefaultParentCategoryValueFromLocation(location: Location): number | null | undefined{
    const parsed = QueryString.parse(location.search)[EDIT_PRODUCT_DEFAULT_PARENT_QUERY_PARAM_KEY];
    if (typeof parsed !== 'string'){return;}
    if (parsed.toUpperCase() === "null".toUpperCase()){
        return null;
    } else {
        const num = Number(parsed);
        if (isNaN(num)){
            return undefined;
        } else {
            return num;
        }
    }
}

// export const MostRecentlySelectedItemType = (() => {
//     const key = "EditProductItemViewHelpers MostRecentlySelectedItemType";

//     const categoryString = "category";
//     const productString = "product";
    
//     const get = () => {
//         const itemTypeString = localStorage.getItem(key);
//         switch (itemTypeString){
//             case categoryString: return ProductDataType.ProductCategory;
//             case productString: return ProductDataType.Product;
//             default: return null;
//         }
//     }

//     const set = (newValue: ProductDataType) => {

//         if (newValue == null){
//             localStorage.removeItem(key);
//             return;
//         }

//         const stringVal = (() => {
//             switch (newValue){
//                 case ProductDataType.Product: return productString;
//                 case ProductDataType.ProductCategory: return categoryString;
//             }
//         })();
//         localStorage.setItem(key, stringVal);
//     }

//     return {get, set};
// })();


export function getDefaultUpdatePropertyStates(props: EditProductItemViewProps, currentLocation: Location): StateProps {

    const defaultParent = getDefaultParentCategoryValueFromLocation(currentLocation);
    
    return {
        itemType: undefined,
        title: props.itemToEdit?.name ?? undefined,
        description: (() => {
            if (props.itemToEdit == null) {
                return undefined;
            } else {
                return props.itemToEdit.description;
            }
        })(),
        parentCategoryID: (() => {
            if (props.itemToEdit == null){
                return defaultParent;
            } else {
                return props.itemToEdit.parent?.id.databaseID ?? null;
            }
        })(),
        imageFile: undefined,
    }
}





export interface ChangesState{
    areThereChangesToBeSaved: boolean;
    hasTheUserMadeChanges: boolean;
}


export function getAreThereChangesToBeSavedValue(props: EditProductItemViewProps, stateProps: StateProps, currentLocation: Location): ChangesState{

    const titleIsChanged: boolean = (() => {

        const oldValue = props.itemToEdit?.name.trim() ?? "";

        const newValue = (() => {
            if (stateProps.title === undefined){
                return oldValue;
            } else {
                return stateProps.title?.trim() ?? "";
            }
        })();

        return oldValue !== newValue;

    })();

    const descriptionIsChanged: boolean = (() => {

        const oldValue = props.itemToEdit?.description?.trim() ?? "";
        const newValue = (() => {
            if (stateProps.description === undefined){
                return oldValue;
            } else {
                return stateProps.description?.trim() ?? "";
            }
        })();
        return oldValue !== newValue;

    })();

    const productDataTypeIsSelected: boolean = stateProps.itemType !== undefined;

    const parentCategoryIDIsChanged: boolean | ChangesState = (() => {

        const defualtParentCategory = getDefaultParentCategoryValueFromLocation(currentLocation);

        const oldValue = (() => {
            if (props.itemToEdit == null){
                return undefined;
            } else {
                return props.itemToEdit.parent?.id.databaseID ?? null;
            }
        })();

        const newValue = (() => {
            if (stateProps.parentCategoryID === undefined){
                return oldValue;
            } else {
                return stateProps.parentCategoryID;
            }
        })();

        if (oldValue !== newValue){
            if (newValue === defualtParentCategory){
                return {
                    hasTheUserMadeChanges: false,
                    areThereChangesToBeSaved: true,
                }
            } else {
                return true;
            }
        } else {
            return false;
        }
    })();

    const imageHasBeenChanged: boolean = (() => {

        const imageVal = "SOME IMAGE";

        const oldValue: string | null = (() => {
            if (props.itemToEdit == null){
                return null;
            } else if (props.itemToEdit.imageURL == null){
                return null;
            } else {
                return imageVal;
            }
        })();

        const newValue: string | null = (() => {
            if (stateProps.imageFile === undefined){
                return oldValue;
            } else if (stateProps.imageFile === null){
                return null;
            } else {
                return imageVal;
            }
        })();

        return oldValue !== newValue;
    })();

    const allChanges = [titleIsChanged, descriptionIsChanged, productDataTypeIsSelected, parentCategoryIDIsChanged, imageHasBeenChanged];

    const areThereChangesToBeSaved = allChanges.some(x => {
        if (typeof x === "boolean"){
            return x;
        } else {
            return x.areThereChangesToBeSaved;
        }
    });

    const hasTheUserMadeChanges = allChanges.some(x => {
        if (typeof x === "boolean"){
            return x;
        } else {
            return x.hasTheUserMadeChanges;
        }
    })
    return {areThereChangesToBeSaved, hasTheUserMadeChanges};
}



export function getAPIUpdateObjectFromState(props: EditProductItemViewProps, stateProps: StateProps): ProductItemProps & { fetchItemType: FetchItemType } {

    const noValueProvidedError = (fieldTitle: string) => {
        return new Error(`The ${fieldTitle} field is required, but you have not provided a value for it.`);
    }

    return {
        title: (() => {

            const trimmedTitle_stateProps = stateProps.title?.trim() ?? undefined;
            const titleValueIsNotValid = typeof trimmedTitle_stateProps != "string" || trimmedTitle_stateProps === "";

            if (props.itemToEdit == null) {
                if (titleValueIsNotValid){
                    throw noValueProvidedError(FieldTitles.title);    
                } else {
                    return trimmedTitle_stateProps;
                }
            } else {
                return trimmedTitle_stateProps === props.itemToEdit.name ? undefined : trimmedTitle_stateProps;
            }
        })(),

        description: (() => {

            const oldValue = props.itemToEdit?.description ?? null;
            const newValue = (() => {
                if (stateProps.description === undefined){
                    return oldValue;
                } else {
                    const trimmedDescription = stateProps.description?.trim() ?? null;
                    return (trimmedDescription === "") ? null : trimmedDescription;
                }
            })();
            return oldValue === newValue ? undefined : newValue;
        })(),

        parentCategoryID: stateProps.parentCategoryID,
        image: stateProps.imageFile,
        fetchItemType: (() => {

            const productDataType = (() => {
                if (props.itemToEdit == null) {
                    if (stateProps.itemType !== undefined) {
                        return stateProps.itemType;
                    } else {
                        throw noValueProvidedError(FieldTitles.itemType);
                    }
                } else {
                    if (isProduct(props.itemToEdit)) {
                        return ProductDataType.Product;
                    } else if (isProductCategory(props.itemToEdit)) {
                        return ProductDataType.ProductCategory;
                    } else {
                        throw new Error("This point should not be reached! Check logic");
                    }
                }
            })();

            switch (productDataType) {
                case ProductDataType.Product: return FetchItemType.PRODUCT;
                case ProductDataType.ProductCategory: return FetchItemType.CATEGORY;
            }
        })(),
    }
}


