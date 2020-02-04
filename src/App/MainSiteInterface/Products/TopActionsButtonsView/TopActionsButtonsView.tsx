
import React from 'react';

import editIcon from '../icons/edit';
import plusIcon from '../icons/plus';
import trashIcon from '../icons/trash';
import homeIcon from '../icons/home';
import logOutIcon from '../icons/logout';

import { DASHBOARD as dashboardURL } from 'topLevelRoutePaths';
import { Link, useHistory } from 'react-router-dom';
import './TopActionsButtonsView.scss';
import { useAlertFunctionality, CustomAlertInfo, CustomAlertButtonInfo, CustomAlertButtonType, CustomAlertController, CustomAlertButtonController, CustomAlertTextFieldInfo, CustomAlertTextFieldController } from 'random-components/CustomAlert/CustomAlert';
import { callIfPossible, Optional } from 'jshelpers';
import { useCurrentProductsPageSubject, ProductsPageSubjectType, useCurrentProductDetailsViewItem } from '../ProductsUIHelpers';
import { DashboardProductsRouteURLs } from '../ProductsRoutesInfo';
import { useDashboardInfo, useRequestsRequiringAuth } from 'App/Dashboard/DashboardUIHelpers';
import { isProduct, isProductCategory, ProductDataObject } from '../ProductsDataHelpers';
import { FetchItemType } from 'API';




export default function TopActionButtonsView() {

    const dashboardInfo = useDashboardInfo();

    const alertFunctionality = useAlertFunctionality();

    function respondToLogOutButtonClicked() {

        let controller: CustomAlertController;

        const dismissAlert = () => callIfPossible(controller?.dismiss);

        const cancelButton = new CustomAlertButtonInfo("Cancel", dismissAlert, CustomAlertButtonType.SECONDARY);

        const logOutButton = new CustomAlertButtonInfo("Log Out", () => {
            dashboardInfo?.logOut();
            dismissAlert();
        }, CustomAlertButtonType.PRIMARY);

        const alertInfo: CustomAlertInfo = {
            uniqueKey: "DASHBOARD LOG OUT WARNING MESSAGE",
            title: "Are you sure? 🤔",
            description: "Are you sure you want to log out?",
            leftButtonInfo: cancelButton,
            rightButtonInfo: logOutButton,
            onMount: c => controller = c,
        };
        alertFunctionality.showAlert(alertInfo);
    }

    const currentSubject = useCurrentProductsPageSubject();

    const createNewLink = DashboardProductsRouteURLs.createProductItem;
    const createNewButtonShouldBeDisplayed = currentSubject != null && currentSubject.type !== ProductsPageSubjectType.CREATE_NEW;

    const editLink: Optional<string> = (() => {
        // we can ignore the error because this hook is still being called unconditionally.
        //eslint-disable-next-line react-hooks/rules-of-hooks
        let item = useCurrentProductDetailsViewItem();
        if (!item){return null;}
        return DashboardProductsRouteURLs.editProductItem(item.id);
    })();
    
    const editButtonShouldBeDisplayed = (() => {
        switch(currentSubject?.type){
            case ProductsPageSubjectType.CATEGORY:
            case ProductsPageSubjectType.PRODUCT:
                return true;
            default: return false;
        }
    })();

    const deleteAlertInfo = useDeleteAlertInfo();

    const respondToDeleteButtonClicked: Optional<() => void> = (() => {
        switch (currentSubject?.type){
            case ProductsPageSubjectType.PRODUCT:
            case ProductsPageSubjectType.CATEGORY:
            case ProductsPageSubjectType.EDIT_ITEM:
                return () => {
                    if (deleteAlertInfo == null){return;}
                    alertFunctionality.showAlert(deleteAlertInfo);
                };
            default: return null;
        }
    })();
        
    const numberOfRightButtons = [
        createNewButtonShouldBeDisplayed,
        editButtonShouldBeDisplayed,
        respondToDeleteButtonClicked,
    ].filter(x => !!x).length;

    const className = [
        "TopActionButtonsView",
        (() => {
            if (numberOfRightButtons > 1){
                return "should-be-spread-out-on-narrow-screen";
            } else {return "";}
        })()
    ].join(" ");

    

    return <div className={className}>
        <TopActionButton svgIcon={homeIcon} title="go home" link={dashboardURL} />
        <TopActionButton svgIcon={logOutIcon} title="log out" onClick={respondToLogOutButtonClicked} className="log-out-button" />
        <div className="spacer-div" />

        {createNewButtonShouldBeDisplayed ? <TopActionButton svgIcon={plusIcon} title="create new item" link={createNewLink} /> : null}

        {editButtonShouldBeDisplayed ? <TopActionButton svgIcon={editIcon} title="edit current item" link={editLink!}/> : null}
        
        {respondToDeleteButtonClicked ? <TopActionButton svgIcon={trashIcon} title="delete current item" onClick={respondToDeleteButtonClicked} isDestructive /> : null}
        
    </div>
}


function TopActionButton(props: { svgIcon: React.ReactElement, isDestructive?: boolean, title: string, link?: string, onClick?: () => void, className?: string }) {

    const className = "TopActionButton" + (" " + props.className ?? "") + (props.isDestructive ?? false ? " destructive" : "");

    if (props.link) {
        return <Link to={props.link} className={className} onClick={props.onClick}>
            {props.svgIcon}
        </Link>
    } else {
        return <button title={props.title} className={className} onClick={props.onClick}>
            {props.svgIcon}
        </button>
    }

}




function useDeleteAlertInfo(): Optional<CustomAlertInfo> {

    const currentlyDisplayedItem = useCurrentProductsPageSubject()?.associatedData;
    const history = useHistory();
    const apiRequests = useRequestsRequiringAuth();

    if (isProductCategory(currentlyDisplayedItem) === false && isProduct(currentlyDisplayedItem) === false){return null;}

    const itemType = (() => {
        if (isProductCategory(currentlyDisplayedItem)){
            return FetchItemType.CATEGORY;
        } else if (isProduct(currentlyDisplayedItem)){
            return FetchItemType.PRODUCT;
        } else {
            throw new Error("this point should not be reached!! Check logic");
        }
    })();

    

    

    const willChildrenBeDeleted = isProductCategory(currentlyDisplayedItem) && currentlyDisplayedItem.children.length >= 1;

    let alertController: CustomAlertController;

    const cancelButton = new CustomAlertButtonInfo("Cancel", dismiss => dismiss(), CustomAlertButtonType.SECONDARY);

    let deleteButtonController: CustomAlertButtonController;

    const deleteButton = new CustomAlertButtonInfo(
        "Delete",
        dismiss => {
            
            if (itemType == null){dismiss(); return;}

            deleteButtonController?.setIsLoading(true);
            apiRequests.deleteItem(itemType, (currentlyDisplayedItem as ProductDataObject).id.databaseID)
            .finally(() => {
                deleteButtonController?.setIsLoading(false);
            }).then(() => {
                dismiss();
                history.replace(DashboardProductsRouteURLs.root);
            }).catch((error) => {
                alertController.showErrorMessage(error.message);
            });
        },
        CustomAlertButtonType.PRIMARY_DESTRUCTIVE,
        c => deleteButtonController = c,
    );

    let textFieldController: Optional<CustomAlertTextFieldController> = null;

    const refreshDeleteButtonActivation = willChildrenBeDeleted ? () => {
        const text = (textFieldController?.currentTextFieldText ?? "").trim();
        callIfPossible(deleteButtonController?.setIsActive, text === confirmationMessage);
    } : null;

    const textFieldInfo: Optional<CustomAlertTextFieldInfo> = willChildrenBeDeleted ? {
        onMount: c => {
            textFieldController = c
            c.textDidChangeNotification.addListener(() => {
                callIfPossible(refreshDeleteButtonActivation);
            });
        },
    } : null;

    const confirmationMessage = "DELETE ALL";

    const description = (() => {
        if (willChildrenBeDeleted){
            return "If you delete this category, ALL products and categories under it will also be deleted. Are you sure you want to continue?\n\nPlease type " + confirmationMessage + " to confirm.";
        } else {
            return `Are you sure you want to delete "${currentlyDisplayedItem.name}"? Once deleted, it cannot be recovered.`;
        }
    })();


    const alertInfo: CustomAlertInfo = {
        uniqueKey: "DASHBOARD DELETE WARNING MESSAGE",
        title: "Are you sure? 🧐",
        description: description,
        textFieldInfo: textFieldInfo ?? undefined,
        leftButtonInfo: cancelButton,
        rightButtonInfo: deleteButton,
        onMount: (c) => {
            alertController = c;
            callIfPossible(refreshDeleteButtonActivation);
        },
    };

    return alertInfo;
}

