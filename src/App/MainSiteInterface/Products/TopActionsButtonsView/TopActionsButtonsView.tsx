import React from 'react';

import editIcon from '../icons/edit';
import plusIcon from '../icons/plus';
import trashIcon from '../icons/trash';
import homeIcon from '../icons/home';
import logOutIcon from '../icons/logout';

import { DASHBOARD as dashboardURL } from 'topLevelRoutePaths';
import { Link } from 'react-router-dom';
import './TopActionsButtonsView.scss';
import { useAlertFunctionality, CustomAlertInfo, CustomAlertButtonInfo, CustomAlertButtonType, CustomAlertController, CustomAlertButtonController, CustomAlertTextFieldInfo, CustomAlertTextFieldController } from 'random-components/CustomAlert/CustomAlert';
import { callIfPossible, Optional } from 'jshelpers';
import { useCurrentProductsPageSubject, ProductsPageSubjectType, useCurrentProductDetailsViewItem } from '../ProductsUIHelpers';
import { DashboardProductsRouteURLs } from '../ProductsRoutesInfo';
import { useDashboardInfo } from 'App/Dashboard/DashboardUIHelpers';




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
    const createNewButtonShouldBeDisplayed = currentSubject.type !== ProductsPageSubjectType.CREATE_NEW;

    const editLink: Optional<string> = (() => {
        // we can ignore the error because this hook is still being called unconditionally.
        //eslint-disable-next-line react-hooks/rules-of-hooks
        let item = useCurrentProductDetailsViewItem();
        if (!item){return null;}
        return DashboardProductsRouteURLs.editProductItem(item.id);
    })();
    
    const editButtonShouldBeDisplayed = (() => {
        switch(currentSubject.type){
            case ProductsPageSubjectType.CATEGORY:
            case ProductsPageSubjectType.PRODUCT:
                return true;
            default: return false;
        }
    })();

    const respondToDeleteButtonClicked: Optional<() => void> = (() => {
        switch (currentSubject.type){
            case ProductsPageSubjectType.PRODUCT:
            case ProductsPageSubjectType.CATEGORY:
            case ProductsPageSubjectType.EDIT_ITEM:
                return () => alertFunctionality.showAlert(getDeleteAlertInfo());
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




function getDeleteAlertInfo(): CustomAlertInfo {

    const cancelButton = new CustomAlertButtonInfo("Cancel", dismiss => dismiss(), CustomAlertButtonType.SECONDARY);

    let deleteButtonController: CustomAlertButtonController;

    const deleteButton = new CustomAlertButtonInfo(
        "Delete",
        dismiss => dismiss(),
        CustomAlertButtonType.PRIMARY_DESTRUCTIVE,
        c => deleteButtonController = c,
    );

    let textFieldController: CustomAlertTextFieldController;

    function refreshDeleteButtonActivation() {
        const text = (textFieldController?.currentTextFieldText ?? "").trim();
        callIfPossible(deleteButtonController?.setIsActive, text === confirmationMessage);
    }

    const textFieldInfo: CustomAlertTextFieldInfo = {
        onMount: c => {
            textFieldController = c
            c.textDidChangeNotification.addListener(() => {
                refreshDeleteButtonActivation();
            });
        },
    }

    const confirmationMessage = "DELETE ALL";

    const alertInfo: CustomAlertInfo = {
        uniqueKey: "DASHBOARD DELETE WARNING MESSAGE",
        title: "Are you sure? 🧐",
        description: "If you delete this category, ALL products and categories under it will also be deleted. Are you sure you want to continue?\n\nPlease type " + confirmationMessage + " to confirm.",
        textFieldInfo: textFieldInfo,
        leftButtonInfo: cancelButton,
        rightButtonInfo: deleteButton,
        onMount: () => {
            refreshDeleteButtonActivation();
        },
    };

    return alertInfo;
}

