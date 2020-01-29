import './EditProductItemView.scss';
import React, { useEffect, useState } from 'react';
import { ProductDataObject } from '../../ProductsDataHelpers';
import { Optional, callIfPossible } from 'jshelpers';
import { useHistory } from 'react-router-dom';
import { useDashboardInfo } from 'App/Dashboard/DashboardUIHelpers';
import TextField, { TextFieldType } from 'random-components/CustomTextField/CustomTextField';
import LoadingButton from 'random-components/LoadingButton/LoadingButton';


export default function EditProductItemView(props: {itemToEdit: Optional<ProductDataObject>}){

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setTitle(props.itemToEdit?.name ?? "");
        setDescription(props.itemToEdit?.description ?? "");
    }, [props.itemToEdit]);
    
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    
    const areThereChangesToBeSaved = trimmedTitle !== (props.itemToEdit?.name ?? "").trim() || trimmedDescription !== (props.itemToEdit?.description ?? "").trim();

    useBlockHistoryWhileMounted("Are you sure you want to leave this page. If you do, all the information you have entered thus far will be lost.", areThereChangesToBeSaved);

    function respondToSubmitButtonClicked(){
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 1500);
    }

    const submitButtonText = props.itemToEdit === null ? "Create" : "Save changes";
 
    return <div className="EditProductItemView">
        <div className="container">
            <TextField className="title" topText="Title" placeholderText="What is the name of the item?" value={title} onTextChange={setTitle}/>
            <TextField className="description" topText="Description" placeholderText="Give some information on the item." type={TextFieldType.MultipleLine} value={description} onTextChange={setDescription}/>
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


