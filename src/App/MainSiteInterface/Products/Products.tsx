
import React, { useEffect } from 'react';
import { Optional, useSetTitleFunctionality } from 'jshelpers';
import { ProductDataObject, productsDataTree, getDataObjectForID } from './ProductsDataHelpers';
import { useRouteMatch, useHistory } from 'react-router-dom';

import { useSpring } from 'react-spring';
import showSideBarIcon from './icons/showSideBarIcon';
import AttachedSideBar from './SideBar/AttachedSideBar/AttachedSideBar';
import { ProductsDataContext } from './ProductsUIHelpers';

import MainContent from './MainContent/MainContent';
import DetatchedSideBar, { DetatchedSideBarFunctionsRef } from './SideBar/DetachedSideBar/DetachedSideBar';

import './Products.scss';
import { useIsDashboard } from 'App/AppUIHelpers';
import TopActionButtonsView from './TopActionsButtonsView/TopActionsButtonsView';
import * as RoutePaths from 'routePaths';


export default function Products() {

    const isDashboard = useIsDashboard();
    useSetTitleFunctionality(isDashboard ? "Dashboard" : "Products");

    const currentProductsDataTree = productsDataTree;

    const selectedItem: Optional<ProductDataObject> = (() => {
        /* eslint-disable react-hooks/rules-of-hooks */
        const baseURL = isDashboard ? RoutePaths.DASHBOARD : RoutePaths.PRODUCTS;
        const idRouteMatch = useRouteMatch<{ id: string }>(baseURL + "/:id");
        const idNum = Number(idRouteMatch?.params.id);
        return getDataObjectForID(idNum);
        /* eslint-enable react-hooks/rules-of-hooks */
    })();

    useScrollToTopOnPathChangeFunctionality();

    const detatchedSideBarfunctions: DetatchedSideBarFunctionsRef = {};

    function respondToSideBarButtonClicked() {
        if (detatchedSideBarfunctions.setIsPresented) {
            detatchedSideBarfunctions.setIsPresented(true, true);
        }
    }


    return <ProductsDataContext.Provider value={{
        currentlySelectedItem: selectedItem,
        allProductItems: currentProductsDataTree,
    }}>
        <div className="Products">
            <div className="content">
                <AttachedSideBar />
                {isDashboard ? <TopActionButtonsView /> : null}
                <MainContent />
                <DetatchedSideBar functionsRef={detatchedSideBarfunctions} />
            </div>
            <div
                onClick={respondToSideBarButtonClicked}
                className="side-bar-button">
                {showSideBarIcon}
            </div>
        </div>
    </ProductsDataContext.Provider>



}


function useScrollToTopOnPathChangeFunctionality() {
    const [, activateSpringAnimation] = useSpring(() => ({ y: 0 }));

    const history = useHistory();

    useEffect(() => {
        let previousLocation = history.location;
        const unregister = history.listen((newLocation) => {
            if (previousLocation.pathname !== newLocation.pathname) {
                const animationOptions = {
                    y: 0,
                    reset: true,
                    from: { y: window.scrollY },
                };
                // casted it because react-spring types doesn't wanna cooperate
                (animationOptions as any).onFrame = (props: any) => {
                    window.scroll(0, props.y);
                };
                activateSpringAnimation(animationOptions);
            }
            previousLocation = newLocation;
        });
        return () => unregister();
        // eslint-disable-next-line
    }, []);
}


