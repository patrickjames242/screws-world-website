

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

const NULL_PARENT_CATEGORY_ID = -1

export default function EditProductItemView(props: EditProductItemViewProps) {

    const [title, setTitle] = useState(props.itemToEdit?.name ?? "");
    const [description, setDescription] = useState(props.itemToEdit?.description ?? "");
    const [isLoading, setIsLoading] = useState(false);
    const [creationOrUpdateHasCompleted, setCreationOrUpdateHasCompleted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<Optional<string>>(null);


    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    const FieldTitles = {
        itemType: "Item Type",
        title: "Title",
        description: "Description",
        parentCategory: "Parent Category",
    }

    const { selectedFetchItemType, setSelectedFetchItemType, getFetchItemTypeSelectElement } = useFetchItemTypeFunctionality(props);
    const fetchItemTypeSelectElement = getFetchItemTypeSelectElement(!isLoading, FieldTitles.itemType);

    const { selectedParentCategoryID, setSelectedParentCategoryID, getParentCategorySelectElement } = useSelectParentCategoryFunctionality(props);
    const parentCategorySelectElement = getParentCategorySelectElement(!isLoading, FieldTitles.parentCategory);

    useEffect(() => {
        setTitle(props.itemToEdit?.name ?? "");
        setDescription(props.itemToEdit?.description ?? "");
        setSelectedFetchItemType(null);
        setSelectedParentCategoryID(getDefaultParentValueForProps(props));
    }, [props.itemToEdit, setSelectedFetchItemType, setSelectedParentCategoryID, props]);

    const history = useHistory();

    
    const areThereChangesToBeSaved = (() => {
        const titleIsChanged = trimmedTitle !== (props.itemToEdit?.name ?? "").trim()
        const descriptionIsChanged = trimmedDescription !== (props.itemToEdit?.description ?? "").trim();
        const fetchItemIsSelected = (fetchItemTypeSelectElement ? (selectedFetchItemType != null) : false);

        const parentCategoryIDIsChanged = (() => {
            const savedValue = (() => {
                if (props.itemToEdit){
                    return props.itemToEdit.parent?.id.databaseID ?? NULL_PARENT_CATEGORY_ID;
                } else {
                    return null;
                }
            })();
            return selectedParentCategoryID !== savedValue;
        })();
        
        return [titleIsChanged, descriptionIsChanged, parentCategoryIDIsChanged, fetchItemIsSelected]
            .some(x => x);
    })();

    useBlockHistoryWhileMounted("Are you sure you want to leave this page? If you do, all the changes you have made will be lost.",
        areThereChangesToBeSaved && creationOrUpdateHasCompleted === false);

    const apiRequests = useRequestsRequiringAuth();

    const apiRequestResult = useRef<Optional<{ fetchItemType: FetchItemType, result: ProductItemNetworkResponse }>>(null);

    function respondToFormSubmission(event: React.FormEvent<HTMLFormElement>) {

        event.preventDefault();

        apiRequestResult.current = null;

        setErrorMessage(null);
        setIsLoading(true);

        function fieldIsRequiredError(fieldName: string): Error {
            return new Error(`The '${fieldName}' field is required.`);
        }

        const valueToBeUsedAsParentCategoryID = (() => {
            //eslint-disable-next-line eqeqeq
            if (selectedParentCategoryID == null || selectedParentCategoryID == NULL_PARENT_CATEGORY_ID) { return null; }
            return selectedParentCategoryID;
        })();


        const objectProps: ProductItemProps = { title: trimmedTitle, description: trimmedDescription, parentCategoryID: valueToBeUsedAsParentCategoryID };

        const fetchItemType = (() => {
            if (isProduct(props.itemToEdit)) {
                return FetchItemType.PRODUCT;
            } else if (isProductCategory(props.itemToEdit)) {
                return FetchItemType.CATEGORY;
            } else if (fetchItemTypeSelectElement) {
                return selectedFetchItemType;
            } else {
                throw new Error("this point is not supposed to be reached!! Check logic");
            }
        })();

        const promise = (() => {

            if (objectProps.title === "") {
                return Promise.reject(fieldIsRequiredError(FieldTitles.title));
            }
            if (props.itemToEdit) {
                return apiRequests.editItem(fetchItemType!, props.itemToEdit.id.databaseID, objectProps)
            } else {
                if (fetchItemType == null) {
                    return Promise.reject(fieldIsRequiredError(FieldTitles.itemType));
                }
                return apiRequests.createNewItem(fetchItemType, objectProps);
            }
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
            {fetchItemTypeSelectElement}
            {parentCategorySelectElement}

            <TextField isEnabled={!isLoading} className="title" isRequired={true} topText={FieldTitles.title} placeholderText="What is the name of the item?" value={title} onTextChange={setTitle} />
            <TextField isEnabled={!isLoading} className="description" topText={FieldTitles.description} placeholderText="Give some information on the item." type={CustomTextFieldType.MultipleLine} value={description} onTextChange={setDescription} />
            {errorMessage ? <ErrorMessageBox errorMessage={errorMessage} /> : null}
            <LoadingButton isActive={areThereChangesToBeSaved} className="submit-button" loadingIndicatorSize="1.8rem" shouldShowIndicator={isLoading}>
                {submitButtonText}
            </LoadingButton>
        </form>
    </div>
}





function useFetchItemTypeFunctionality(props: EditProductItemViewProps) {

    const [selectedFetchItemType, setSelectedFetchItemType] = useState<Optional<FetchItemType>>(null);
    const { getItemTypeForString, getStringForItemType } = useFetchItemTypeConversion();

    function respondToItemTypeDidChange(stringValue: string) {
        const newItemType = getItemTypeForString(stringValue);
        setSelectedFetchItemType(newItemType);
    }

    const getFetchItemTypeSelectElement = (isEnabled: boolean, topText: string) => {
        if (props.itemToEdit) { return null; }

        const value = (() => {
            if (selectedFetchItemType == null) { return ""; }
            return getStringForItemType(selectedFetchItemType);
        })();

        return <CustomSelect isEnabled={isEnabled} topText={topText} value={value} placeholderText="Is this a product or category?" onValueChange={respondToItemTypeDidChange}>
            {[FetchItemType.PRODUCT, FetchItemType.CATEGORY]
                .map(x => {
                    const string = getStringForItemType(x);
                    return { uniqueID: string, stringValue: string };
                })}
        </CustomSelect>

    };

    return { selectedFetchItemType, setSelectedFetchItemType, getFetchItemTypeSelectElement };
}

function useFetchItemTypeConversion() {

    const productText = "Product";
    const categoryText = "Category";

    function getStringForItemType(type: FetchItemType): string {
        switch (type) {
            case FetchItemType.PRODUCT: return productText;
            case FetchItemType.CATEGORY: return categoryText;
        }
    }

    function getItemTypeForString(string: string): Optional<FetchItemType> {
        switch (string) {
            case productText: return FetchItemType.PRODUCT;
            case categoryText: return FetchItemType.CATEGORY;
            default: return null;
        }
    }

    return { getStringForItemType, getItemTypeForString };
}




function useSelectParentCategoryFunctionality(props: EditProductItemViewProps) {

    const [selectedParentCategoryID, setSelectedParentCategoryID] = useState<Optional<number>>(getDefaultParentValueForProps(props));

    const allCategories = useProductsInfoContextValue().data?.allCategories ?? [];

    const customSelectChildren = useMemo(() => {
        let children: CustomSelectChild[] = [];

        allCategories.forEach(x => {
            if (x.id.databaseID === props.itemToEdit?.id.databaseID){return;}

            const title = (function getRecursiveTitleFor(category: ProductCategory): string{
                const titleItems = [category.name];
                if (category.parent != null){
                    titleItems.unshift(getRecursiveTitleFor(category.parent));
                }
                return titleItems.join(", ");
            })(x);

            children.push({ uniqueID: String(x.id.databaseID), stringValue: title });
        });
        children = children.sort((x1, x2) => x1.stringValue.localeCompare(x2.stringValue));
        children.unshift({ uniqueID: String(NULL_PARENT_CATEGORY_ID), stringValue: "None (should be top level)" });
        return children;
    }, [allCategories, props.itemToEdit]);


    function respondToValueDidChange(stringValue: string) {
        const num = Number(stringValue);
        if (isNaN(num)) {
            throw new Error("this should be valid! Check logic");
        }
        setSelectedParentCategoryID(num);
    }

    const getParentCategorySelectElement = (isEnabled: boolean, topText: string) => {
        const value = (() => {
            if (selectedParentCategoryID == null) { return ""; }
            return selectedParentCategoryID + ""; // to coerce the number to a string;
        })();

        
        return <CustomSelect isEnabled={isEnabled} topText={topText} value={value} placeholderText="What is the parent category?" onValueChange={respondToValueDidChange}>
            {customSelectChildren}
        </CustomSelect>
    };

    return { selectedParentCategoryID, setSelectedParentCategoryID, getParentCategorySelectElement };
}

function getDefaultParentValueForProps(props: EditProductItemViewProps): Optional<number> {

    if (props.itemToEdit != null) {
        return props.itemToEdit.parent?.id.databaseID ?? NULL_PARENT_CATEGORY_ID;
    } else {
        return null;
    }

}







function getProductDataTypeForFetchItemType(fetchItemType: FetchItemType): ProductDataType {
    switch (fetchItemType) {
        case FetchItemType.PRODUCT: return ProductDataType.Product;
        case FetchItemType.CATEGORY: return ProductDataType.ProductCategory;
    }
}

