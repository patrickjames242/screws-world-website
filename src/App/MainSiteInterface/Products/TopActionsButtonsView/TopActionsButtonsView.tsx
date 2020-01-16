import React from 'react';

import editIcon from '../icons/edit';
import plusIcon from '../icons/plus';
import trashIcon from '../icons/trash';
import homeIcon from '../icons/home';
import logOutIcon from '../icons/logout';

import {DASHBOARD as dashboardURL} from 'routePaths';
import { Link } from 'react-router-dom';
import './TopActionsButtonsView.scss';
import { useDashboardInfo } from 'App/AppUIHelpers';

export default function TopActionButtonsView(){

    const dashboardInfo = useDashboardInfo();

    function respondToLogOutButtonClicked(){
        dashboardInfo?.logOut();
    }
    
    return <div className="TopActionButtonsView">
        <TopActionButton svgIcon={homeIcon} title="go home" link={dashboardURL}/>
        <TopActionButton svgIcon={logOutIcon} title="log out" onClick={respondToLogOutButtonClicked} className="log-out-button"/>
        <div className="spacer-div"/>
        <TopActionButton svgIcon={plusIcon} title="create new item"/>
        <TopActionButton svgIcon={editIcon} title="edit current item"/>
        <TopActionButton svgIcon={trashIcon} title="delete current item" isDestructive/>
    </div>
}


function TopActionButton(props: {svgIcon: React.ReactElement, isDestructive?: boolean, title: string, link?: string, onClick?: () => void, className?: string }){

    const className = "TopActionButton" + (" " + props.className ?? "") + (props.isDestructive ?? false ? " destructive" : "");

    if (props.link){
        return <Link to={props.link} className={className} onClick={props.onClick}>
            {props.svgIcon}
        </Link>
    } else {
        return <button title={props.title} className={className} onClick={props.onClick}>
            {props.svgIcon}
        </button>
    }
    
}
