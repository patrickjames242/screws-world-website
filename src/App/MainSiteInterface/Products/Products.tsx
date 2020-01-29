
import React, { useEffect, useMemo } from 'react';
import { useSetTitleFunctionality } from 'jshelpers';

import { useHistory, useLocation } from 'react-router-dom';

import { useSpring } from 'react-spring';
import showSideBarIcon from './icons/showSideBarIcon';
import AttachedSideBar from './SideBar/AttachedSideBar/AttachedSideBar';
import { ProductsInfoContext, getProductsPageSubjectForRoutePath} from './ProductsUIHelpers';

import MainContent from './MainContent/MainContent';
import DetatchedSideBar, { DetatchedSideBarFunctionsRef } from './SideBar/DetachedSideBar/DetachedSideBar';

import './Products.scss';
import TopActionButtonsView from './TopActionsButtonsView/TopActionsButtonsView';
import { productsDataTree } from './ProductsDataHelpers';
import { useIsDashboard } from 'App/Dashboard/DashboardUIHelpers';



export default function Products() {

    const isDashboard = useIsDashboard();
    useSetTitleFunctionality(isDashboard ? "Dashboard" : "Products");

    useScrollToTopOnPathChangeFunctionality();

    const detatchedSideBarfunctions: DetatchedSideBarFunctionsRef = {};

    function respondToSideBarButtonClicked() {
        if (detatchedSideBarfunctions.setIsPresented) {
            detatchedSideBarfunctions.setIsPresented(true, true);
        }
    }

    const location = useLocation();

    const contextProviderValue = useMemo(() => {
        const subject = getProductsPageSubjectForRoutePath(location.pathname)!;
        const allTopLevelItems = productsDataTree;
        return {subject, allTopLevelItems};
    }, [location.pathname]);
    
    return <ProductsInfoContext.Provider value={contextProviderValue}>
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
    </ProductsInfoContext.Provider>
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


