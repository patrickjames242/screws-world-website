

import { EditProductItemViewProps, StateProps, FieldTitles } from "./commonStuff";
import { ProductItemProps, FetchItemType } from "API";
import { isProduct, ProductDataType, isProductCategory } from "../../ProductsDataHelpers";


export function getDefaultUpdatePropertyStates(props: EditProductItemViewProps): StateProps {
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
            if (props.itemToEdit == null) {
                return undefined;
            } else {
                return props.itemToEdit.parent?.id.databaseID ?? null;
            }
        })(),
        imageFile: undefined,
    }
}








export function getAreThereChangesToBeSavedValue(props: EditProductItemViewProps, stateProps: StateProps): boolean {

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

    const parentCategoryIDIsChanged: boolean = (() => {

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

        return oldValue !== newValue;
    })();

    const imageHasBeenSelected: boolean = (() => {
        if (stateProps.imageFile === undefined) {
            return false;
        } else if (props.itemToEdit != null) {
            return (stateProps.imageFile === null && props.itemToEdit.imageURL === null) === false;
        } else {
            return true;
        }
    })();

    return [titleIsChanged, descriptionIsChanged, productDataTypeIsSelected, parentCategoryIDIsChanged, imageHasBeenSelected]
        .some(x => x);
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