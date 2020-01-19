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
import { useAlertFunctionality, CustomAlertInfo, CustomAlertButtonInfo, CustomAlertButtonType, CustomAlertController } from 'random-components/CustomAlert/CustomAlert';
import { callIfPossible } from 'jshelpers';




export default function TopActionButtonsView() {

    const dashboardInfo = useDashboardInfo();

    const alertFunctionality = useAlertFunctionality();

    function respondToDeleteButtonClicked() {

        const controllerRef: CustomAlertController = {};

        const buttonDismissAction = () => callIfPossible(controllerRef.dismiss)

        const cancelButton = new CustomAlertButtonInfo("Cancel", buttonDismissAction, CustomAlertButtonType.SECONDARY);
        
        const deleteButton = new CustomAlertButtonInfo("Delete", buttonDismissAction, CustomAlertButtonType.PRIMARY_DESTRUCTIVE);

        const alertInfo: CustomAlertInfo = {
            uniqueKey: "DASHBOARD DELETE WARNING MESSAGE",
            title: "Are you sure?",
            description: "Deleted items cannot be recovered. Are you sure you want to continue?",
            showsTextField: false,
            leftButtonInfo: cancelButton,
            rightButtonInfo: deleteButton,
            controller: controllerRef,
        };
        alertFunctionality.showAlert(alertInfo);
    }

    function respondToLogOutButtonClicked() {

        const controllerRef: CustomAlertController = {};

        const dismissAlert = () => callIfPossible(controllerRef.dismiss);
        
        const cancelButton = new CustomAlertButtonInfo("Cancel", dismissAlert, CustomAlertButtonType.SECONDARY);
        
        const logOutButton = new CustomAlertButtonInfo("Log Out", () => {
            dashboardInfo?.logOut();
            dismissAlert();
        }, CustomAlertButtonType.PRIMARY);

        const alertInfo: CustomAlertInfo = {
            uniqueKey: "DASHBOARD LOG OUT WARNING MESSAGE",
            title: "Are you sure?",
            description: "Are you sure you want to log out?",
            showsTextField: false,
            leftButtonInfo: cancelButton,
            rightButtonInfo: logOutButton,
            controller: controllerRef,
        };
        alertFunctionality.showAlert(alertInfo);
    }

    

    return <div className="TopActionButtonsView">
        <TopActionButton svgIcon={homeIcon} title="go home" link={dashboardURL} />
        <TopActionButton svgIcon={logOutIcon} title="log out" onClick={respondToLogOutButtonClicked} className="log-out-button" />
        <div className="spacer-div" />
        <TopActionButton svgIcon={plusIcon} title="create new item" />
        <TopActionButton svgIcon={editIcon} title="edit current item" />
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
