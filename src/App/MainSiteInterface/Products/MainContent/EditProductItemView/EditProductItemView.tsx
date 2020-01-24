import './EditProductItemView.scss';
import React, { useEffect } from 'react';
import { ProductDataObject } from '../../ProductsDataHelpers';
import { Optional, callIfPossible } from 'jshelpers';
import { useHistory } from 'react-router-dom';
import { useDashboardInfo } from 'App/Dashboard/DashboardUIHelpers';

export default function EditProductItemView(props: {itemToEdit: Optional<ProductDataObject>}){

    useBlockHistoryWhileMounted("Are you sure you want to leave this page. If you do, all the information you have entered thus far will be lost.");

    return <div style={{
        height: "500px",
        backgroundColor: "red",
    }} className="EditProductItemView">
        
    </div>
}


function useBlockHistoryWhileMounted(message: string){
    const history = useHistory();
    const dashboardInfo = useDashboardInfo();
    useEffect(() => {
        const unblock = history.block(message);
        const unlistenToNotification = dashboardInfo?.userWillLogOutNotification.addListener(() => {
            unblock();
        });
        return () => {
            callIfPossible(unlistenToNotification);
            unblock();
        };
    }, [history, message, dashboardInfo]);
}


