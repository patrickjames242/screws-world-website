import './EditProductItemView.scss';
import React, { useEffect, useState } from 'react';
import { ProductDataObject, isProduct, isProductCategory } from '../../ProductsDataHelpers';
import { Optional, callIfPossible } from 'jshelpers';
import { useHistory } from 'react-router-dom';
import { useDashboardInfo, useRequestsRequiringAuth } from 'App/Dashboard/DashboardUIHelpers';
import TextField, { CustomTextFieldType } from 'random-components/CustomInputs/CustomTextField/CustomTextField';
import LoadingButton from 'random-components/LoadingButton/LoadingButton';
import ErrorMessageBox from 'random-components/ErrorMessageBox/ErrorMessageBox';
import { FetchItemType } from 'API';


export default function EditProductItemView(props: {itemToEdit: Optional<ProductDataObject>}){

    const [title, setTitle] = useState(props.itemToEdit?.name ?? "");
    const [description, setDescription] = useState(props.itemToEdit?.description ?? "");
    const [isLoading, setIsLoading] = useState(false);

    const [errorMessage, setErrorMessage] = useState<Optional<string>>(null);

    useEffect(() => {
        setTitle(props.itemToEdit?.name ?? "");
        setDescription(props.itemToEdit?.description ?? "");
    }, [props.itemToEdit]);
    
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    
    const areThereChangesToBeSaved = trimmedTitle !== (props.itemToEdit?.name ?? "").trim() || trimmedDescription !== (props.itemToEdit?.description ?? "").trim();
    
    useBlockHistoryWhileMounted("Are you sure you want to leave this page. If you do, all the information you have entered thus far will be lost.", areThereChangesToBeSaved);

    const apiRequests = useRequestsRequiringAuth();

    function respondToSubmitButtonClicked(){
        setErrorMessage(null);
        setIsLoading(true);
        const promise = (() => {
            const objectProps = {title, description};
            if (props.itemToEdit){
                
                const fetchItemType = (() => {
                    if (isProduct(props.itemToEdit)){
                        return FetchItemType.PRODUCT;
                    } else if (isProductCategory(props.itemToEdit)){
                        return FetchItemType.CATEGORY;
                    } else {
                        throw new Error("Must be either a product or a category!!! How is this possible???")
                    }
                })();

                return apiRequests.editItem(fetchItemType, props.itemToEdit.id.databaseID, objectProps)
            } else {
                return apiRequests.createNewItem(FetchItemType.PRODUCT, objectProps);
            }
        })();
        
        promise.finally(() => {
            setIsLoading(false);
        })
        .then((result) => {
           
        })
        .catch((error) => {
            setErrorMessage(error.message);
        });
    }

    const submitButtonText = props.itemToEdit === null ? "Create" : "Save changes";
 
    return <div className="EditProductItemView">
        <div className="container">
            <TextField className="title" topText="Title" placeholderText="What is the name of the item?" value={title} onTextChange={setTitle}/>
            <TextField className="description" topText="Description" placeholderText="Give some information on the item." type={CustomTextFieldType.MultipleLine} value={description} onTextChange={setDescription}/>
            {errorMessage ? <ErrorMessageBox errorMessage={errorMessage}/> : null}
            <LoadingButton isActive={areThereChangesToBeSaved} className="submit-button" loadingIndicatorSize="1.8rem" shouldShowIndicator={isLoading} onClick={respondToSubmitButtonClicked}>
                {submitButtonText}
            </LoadingButton>
        </div>
    </div>
}



function useBlockHistoryWhileMounted(message: string, shouldBlock: boolean = true){
    const history = useHistory();
    const dashboardInfo = useDashboardInfo();
    useEffect(() => {
        if (shouldBlock === false){return;}
        const unblock = history.block(message);
        const unlistenToNotification = dashboardInfo?.userWillLogOutNotification.addListener(() => {
            unblock();
        });
        return () => {
            callIfPossible(unlistenToNotification);
            unblock();
        };
    }, [history, message, dashboardInfo, shouldBlock]);
}


