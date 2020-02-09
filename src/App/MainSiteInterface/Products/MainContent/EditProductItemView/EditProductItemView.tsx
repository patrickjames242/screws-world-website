

import './EditProductItemView.scss';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { ProductDataObject, isProduct, isProductCategory, ProductsDataObjectID, ProductDataType, ProductCategory } from '../../ProductsDataHelpers';
import { Optional, useBlockHistoryWhileMounted } from 'jshelpers';
import { useHistory } from 'react-router-dom';
import { useRequestsRequiringAuth } from 'App/Dashboard/DashboardUIHelpers';
import TextField, { CustomTextFieldType } from 'random-components/CustomInputs/CustomTextField/CustomTextField';
import LoadingButton from 'random-components/LoadingButton/LoadingButton';
import ErrorMessageBox from 'random-components/ErrorMessageBox/ErrorMessageBox';
import { FetchItemType, ProductItemNetworkResponse, ProductItemProps } from 'API';
import CustomSelect, { CustomSelectChild } from 'random-components/CustomInputs/CustomSelect/CustomSelect';
import { DashboardProductsRouteURLs } from '../../ProductsRoutesInfo';
import { useProductsInfoContextValue } from '../../ProductsUIHelpers';




interface EditProductItemViewProps {
    itemToEdit: Optional<ProductDataObject>,
}


const FieldTitles = {
    itemType: "Item Type",
    title: "Title",
    description: "Description",
    parentCategory: "Parent Category",
    image: "Image",
}


// undefined means no value should be pushed to server. null means current value in server database should be deleted.
type OptionalDatabaseValue<Type> = Type | null | undefined;
type RequiredDatabaseValue<Type> = Type | undefined;

interface StateProps {
    itemType: RequiredDatabaseValue<ProductDataType>,
    parentCategoryID: OptionalDatabaseValue<number>,
    title: RequiredDatabaseValue<string>,
    description: OptionalDatabaseValue<string>,
    imageFile: OptionalDatabaseValue<File>,
}


function getDefaultUpdatePropertyStates(props: EditProductItemViewProps): StateProps {
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








function getAreThereChangesToBeSavedValue(props: EditProductItemViewProps, stateProps: StateProps): boolean {

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



function getAPIUpdateObjectFromState(props: EditProductItemViewProps, stateProps: StateProps): ProductItemProps & { fetchItemType: FetchItemType } {

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




export default function EditProductItemView(props: EditProductItemViewProps) {

    const defaultStates = getDefaultUpdatePropertyStates(props);

    const [itemType, setItemType] = useState(defaultStates.itemType);
    const [parentCategoryID, setParentCategoryID] = useState(defaultStates.parentCategoryID);
    const [title, setTitle] = useState(defaultStates.title);
    const [description, setDescription] = useState(defaultStates.description);
    const [imageFile, setImageFile] = useState(defaultStates.imageFile);

    const currentPropertiesStates: StateProps = {
        itemType, parentCategoryID, title, description, imageFile,
    }

    const [isLoading, setIsLoading] = useState(false);
    const [creationOrUpdateHasCompleted, setCreationOrUpdateHasCompleted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<Optional<string>>(null);




    useEffect(() => {
        const defaultStates = getDefaultUpdatePropertyStates(props);
        setItemType(defaultStates.itemType);
        setParentCategoryID(defaultStates.parentCategoryID);
        setTitle(defaultStates.title);
        setDescription(defaultStates.description);
        setImageFile(defaultStates.imageFile);
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.itemToEdit]);

    const history = useHistory();


    const areThereChangesToBeSaved = getAreThereChangesToBeSavedValue(props, currentPropertiesStates);

    useBlockHistoryWhileMounted("Are you sure you want to leave this page? If you do, all the changes you have made will be lost.",
        areThereChangesToBeSaved && creationOrUpdateHasCompleted === false);

    const apiRequests = useRequestsRequiringAuth();

    const apiRequestResult = useRef<Optional<{ fetchItemType: FetchItemType, result: ProductItemNetworkResponse }>>(null);

    function respondToFormSubmission(event: React.FormEvent<HTMLFormElement>) {

        event.preventDefault();

        apiRequestResult.current = null;

        setErrorMessage(null);
        setIsLoading(true);

        let fetchItemType: FetchItemType;

        const promise = (() => {
            try {

                // if any values required for the api request are not provided, the below function call should throw an error that we will catch
                const objectProps = getAPIUpdateObjectFromState(props, currentPropertiesStates);
                fetchItemType = objectProps.fetchItemType;
                if (props.itemToEdit != null) {
                    return apiRequests.editItem(objectProps.fetchItemType, props.itemToEdit.id.databaseID, objectProps)
                } else {
                    return apiRequests.createNewItem(objectProps.fetchItemType, objectProps);
                }
            } catch (error) { return Promise.reject(error) }

        })();

        promise.finally(() => {
            setIsLoading(false);
        }).then((result) => {

            if (fetchItemType == null) { return; }
            apiRequestResult.current = { fetchItemType, result };
            setCreationOrUpdateHasCompleted(true);

        }).catch((error) => {
            setErrorMessage(error.message);
        });
    }

    useEffect(() => {
        if (creationOrUpdateHasCompleted === false || !apiRequestResult.current) { return; }

        if (props.itemToEdit) {
            history.goBack();
        } else {
            const dataType = getProductDataTypeForFetchItemType(apiRequestResult.current.fetchItemType);
            const id = new ProductsDataObjectID(apiRequestResult.current.result.id, dataType);
            history.replace(DashboardProductsRouteURLs.productDetailsView(id));
        }

    }, [creationOrUpdateHasCompleted, history, props.itemToEdit]);

    const submitButtonText = props.itemToEdit === null ? "Create" : "Save changes";


    return <div className="EditProductItemView">
        <form className="container" onSubmit={respondToFormSubmission}>

            <ProductItemTypeSelector isEnabled={!isLoading} itemBeingEdited={props.itemToEdit} value={itemType} onValueChange={setItemType} />

            <ProductItemParentCategorySelector isEnabled={!isLoading} itemBeingEdited={props.itemToEdit} value={parentCategoryID} onValueChange={setParentCategoryID} />

            <TextField isEnabled={!isLoading} className="title" isRequired={true} topText={FieldTitles.title} placeholderText="What is the name of the item?" value={title ?? ""} onTextChange={setTitle} />

            <TextField isEnabled={!isLoading} className="description" topText={FieldTitles.description} placeholderText="Give some information on the item." type={CustomTextFieldType.MultipleLine} value={description ?? ""} onTextChange={setDescription} />

            {errorMessage ? <ErrorMessageBox errorMessage={errorMessage} /> : null}

            <LoadingButton isActive={areThereChangesToBeSaved} className="submit-button" loadingIndicatorSize="1.8rem" shouldShowIndicator={isLoading}>
                {submitButtonText}
            </LoadingButton>
        </form>
    </div>
}







function getProductDataTypeForFetchItemType(fetchItemType: FetchItemType): ProductDataType {
    switch (fetchItemType) {
        case FetchItemType.PRODUCT: return ProductDataType.Product;
        case FetchItemType.CATEGORY: return ProductDataType.ProductCategory;
    }
}










function ProductItemTypeSelector(props: {
    isEnabled: boolean,
    itemBeingEdited: Optional<ProductDataObject>,
    value: RequiredDatabaseValue<ProductDataType>,
    onValueChange: (newValue: RequiredDatabaseValue<ProductDataType>) => void,
}) {

    const { getStringForItemType, getItemTypeForString } = (() => {
        const productText = "Product";
        const categoryText = "Category";

        function getStringForItemType(type: ProductDataType): string {
            switch (type) {
                case ProductDataType.Product: return productText;
                case ProductDataType.ProductCategory: return categoryText;
            }
        }

        function getItemTypeForString(string: string): Optional<ProductDataType> {
            switch (string) {
                case productText: return ProductDataType.Product;
                case categoryText: return ProductDataType.ProductCategory;
                default: return null;
            }
        }

        return { getStringForItemType, getItemTypeForString };
    })();


    function respondToItemTypeDidChange(stringValue: string) {
        const newValue = (() => {
            if (stringValue === "") {
                return undefined;
            } else {
                const convertedItemType = getItemTypeForString(stringValue);
                if (convertedItemType == null) {
                    throw new Error("this isn't supposed to be null. Check the logic");
                }
                return convertedItemType;
            }
        })();
        props.onValueChange(newValue);
    }

    const value = (() => {
        return props.value !== undefined ? getStringForItemType(props.value) : "";
    })();

    return <>
        {(() => {
            if (props.itemBeingEdited == null) {
                return <CustomSelect isEnabled={props.isEnabled} topText={FieldTitles.itemType} value={value} placeholderText="Is this a product or category?" onValueChange={respondToItemTypeDidChange}>
                    {[ProductDataType.Product, ProductDataType.ProductCategory]
                        .map(x => {
                            const string = getStringForItemType(x);
                            return { uniqueID: string, stringValue: string };
                        })}
                </CustomSelect>
            } else {
                return null;
            }
        })()}
    </>
}











function ProductItemParentCategorySelector(props: {
    isEnabled: boolean,
    itemBeingEdited: Optional<ProductDataObject>,
    value: OptionalDatabaseValue<number>,
    onValueChange: (newValue: OptionalDatabaseValue<number>) => void,
}) {

    const NULL_PARENT_CATEGORY_ID = -1;

    const productsInfoConstextValue = useProductsInfoContextValue();

    const allCategories = productsInfoConstextValue.data?.allCategories ?? [];

    const customSelectChildren = useMemo(() => {
        let children: CustomSelectChild[] = [];

        allCategories.forEach(x => {
            if (x.id.databaseID === props.itemBeingEdited?.id.databaseID) { return; }

            const title = (function getRecursiveTitleFor(category: ProductCategory): string {
                const titleItems = [category.name];
                if (category.parent != null) {
                    titleItems.unshift(getRecursiveTitleFor(category.parent));
                }
                return titleItems.join(", ");
            })(x);

            children.push({ uniqueID: String(x.id.databaseID), stringValue: title });
        });
        children = children.sort((x1, x2) => x1.stringValue.localeCompare(x2.stringValue));
        children.unshift({ uniqueID: String(NULL_PARENT_CATEGORY_ID), stringValue: "None (should be top level)" });
        return children;
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productsInfoConstextValue, props.itemBeingEdited]);


    function respondToValueDidChange(stringValue: string) {

        const newValue = (() => {
            if (stringValue === "") {
                return undefined;
            }
            const num = Number(stringValue);
            if (isNaN(num)) {
                throw new Error("this should be valid! Check logic");
            }
            if (num === NULL_PARENT_CATEGORY_ID) {
                return null;
            } else {
                return num;
            }
        })();

        props.onValueChange(newValue);
    }

    const value = (() => {
        if (props.value === undefined) {
            return "";
        } else if (props.value === null) {
            return String(NULL_PARENT_CATEGORY_ID);
        } else {
            return String(props.value);
        }
    })();


    return <CustomSelect isEnabled={props.isEnabled} topText={FieldTitles.parentCategory} value={value} placeholderText="What is the parent category?" onValueChange={respondToValueDidChange}>
        {customSelectChildren}
    </CustomSelect>
}