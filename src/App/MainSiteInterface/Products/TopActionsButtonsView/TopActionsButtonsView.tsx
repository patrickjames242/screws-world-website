import React from 'react';

import editIcon from '../icons/edit';
import plusIcon from '../icons/plus';
import trashIcon from '../icons/trash';
import homeIcon from '../icons/home';
import logOutIcon from '../icons/logout';

import { DASHBOARD as dashboardURL } from 'routePaths';
import { Link } from 'react-router-dom';
import './TopActionsButtonsView.scss';
import { useDashboardInfo } from 'App/AppUIHelpers';
import { useAlertFunctionality, CustomAlertInfo, CustomAlertButtonInfo, CustomAlertButtonType, CustomAlertController, CustomAlertButtonController, CustomAlertTextFieldInfo, CustomAlertTextFieldController } from 'random-components/CustomAlert/CustomAlert';
import { callIfPossible } from 'jshelpers';




export default function TopActionButtonsView() {

    const dashboardInfo = useDashboardInfo();

    const alertFunctionality = useAlertFunctionality();

    function respondToDeleteButtonClicked(){
        alertFunctionality.showAlert(getDeleteAlertInfo());
    }

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

    function showFeatureNotAvailableAlert() {
        let controller: CustomAlertController;

        const dismissAlert = () => callIfPossible(controller?.dismiss);

        const okButton = new CustomAlertButtonInfo("OK", () => {
            dismissAlert();
        }, CustomAlertButtonType.PRIMARY);

        const alertInfo: CustomAlertInfo = {
            uniqueKey: "DASHBOARD FEATURE NOT AVAILABLE MESSAGE",
            title: "Oops 😱",
            description: "This feature is not available yet.",
            rightButtonInfo: okButton,
            onMount: c => controller = c,
        };
        alertFunctionality.showAlert(alertInfo);
    }

    return <div className="TopActionButtonsView">
        <TopActionButton svgIcon={homeIcon} title="go home" link={dashboardURL} />
        <TopActionButton svgIcon={logOutIcon} title="log out" onClick={respondToLogOutButtonClicked} className="log-out-button" />
        <div className="spacer-div" />
        <TopActionButton svgIcon={plusIcon} title="create new item" onClick={showFeatureNotAvailableAlert} />
        <TopActionButton svgIcon={editIcon} title="edit current item" onClick={showFeatureNotAvailableAlert} />
        <TopActionButton svgIcon={trashIcon} title="delete current item" onClick={respondToDeleteButtonClicked} isDestructive />
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

    let controller: CustomAlertController;

    const buttonDismissAction = () => callIfPossible(controller?.dismiss)

    const cancelButton = new CustomAlertButtonInfo("Cancel", buttonDismissAction, CustomAlertButtonType.SECONDARY);

    let deleteButtonController: CustomAlertButtonController;

    const deleteButton = new CustomAlertButtonInfo(
        "Delete",
        buttonDismissAction,
        CustomAlertButtonType.PRIMARY_DESTRUCTIVE,
        c => deleteButtonController = c
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
        onMount: (c) => {
            controller = c;
            refreshDeleteButtonActivation();
        },
    };

    return alertInfo;
}
