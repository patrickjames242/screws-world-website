

import './EditProductItemView.scss';
import React, { useEffect, useState, useRef } from 'react';
import { ProductsDataObjectID, ProductDataType } from '../../ProductsDataHelpers';
import { Optional, useBlockHistoryWhileMounted } from 'jshelpers';
import { useHistory } from 'react-router-dom';
import { useRequestsRequiringAuth } from 'App/Dashboard/DashboardUIHelpers';
import TextField, { CustomTextFieldType } from 'random-components/CustomInputs/CustomTextField/CustomTextField';
import LoadingButton from 'random-components/LoadingButton/LoadingButton';
import ErrorMessageBox from 'random-components/ErrorMessageBox/ErrorMessageBox';
import { FetchItemType, ProductItemNetworkResponse } from 'API';

import { DashboardProductsRouteURLs } from '../../ProductsRoutesInfo';
import ProductItemTypeSelector from './ChildComponents/ProductItemTypeSelector';
import ProductItemParentCategorySelector from './ChildComponents/ParentCategorySelector';
import { getDefaultUpdatePropertyStates, getAreThereChangesToBeSavedValue, getAPIUpdateObjectFromState, EditProductItemViewProps, StateProps, FieldTitles } from './EditProductItemViewHelpers';
import ProductItemImageSelector from './ChildComponents/ImageSelector/ImageSelector';



console.warn("remember to write code that guesses an appropriate default parent category when the create new button is clicked");
console.warn("when you add an image and remove it on the edit products page, for a creation, the save button is not grayed out");

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
        
        if (isLoading){return;}

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
            
            <ProductItemImageSelector itemBeingEdited={props.itemToEdit} value={imageFile} onValueChange={setImageFile}/>

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



