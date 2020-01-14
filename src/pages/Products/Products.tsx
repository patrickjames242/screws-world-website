
import React, { useEffect } from 'react';
import { Optional, useSetTitleFunctionality } from 'jshelpers';
import { ProductDataObject, productsDataTree, getDataObjectForID } from './ProductsDataHelpers';
import { useRouteMatch, Switch, Route, useHistory, Link } from 'react-router-dom';
import NotFoundPage from 'random-components/NotFoundPage/NotFoundPage';
import { useSpring } from 'react-spring';
import showSideBarIcon from './icons/showSideBarIcon';
import AttachedSideBar from './SideBar/AttachedSideBar/AttachedSideBar';
import { ProductsDataContext } from './ProductsUIHelpers';

import MainContent from './MainContent/MainContent';
import DetatchedSideBar, { DetatchedSideBarFunctionsRef } from './SideBar/DetachedSideBar/DetachedSideBar';

import './Products.scss';
import { useIsDashboard } from 'App/AppUIHelpers';

import editIcon from './icons/edit.js';
import plusIcon from './icons/plus.js';
import trashIcon from './icons/trash.js';
import homeIcon from './icons/home.js';

import {DASHBOARD as dashboardURL} from 'routePaths';

export default function Products() {

    const isDashboard = useIsDashboard();
    useSetTitleFunctionality( isDashboard ? "Dashboard" : "Products");

    const currentProductsDataTree = productsDataTree;

    const { url: currentURL } = useRouteMatch();

    const selectedItem: Optional<ProductDataObject> = (() => {
        /* eslint-disable react-hooks/rules-of-hooks */
        const idRouteMatch = (useRouteMatch<{ id: string }>(currentURL + "/:id"));
        const idString = idRouteMatch?.params.id;
        if (idString == null) { return null; }
        const selectedItemID = Number(idString);
        return getDataObjectForID(selectedItemID);
        /* eslint-enable react-hooks/rules-of-hooks */
    })();

    useScrollToTopOnPathChangeFunctionality();

    const detatchedSideBarfunctions: DetatchedSideBarFunctionsRef = {};

    function respondToSideBarButtonClicked(){
        if (detatchedSideBarfunctions.setIsPresented){
            detatchedSideBarfunctions.setIsPresented(true, true);
        }
    }

    return <Switch>
        <Route path={[currentURL, currentURL + "/:id"]} exact render={() => {
            return <ProductsDataContext.Provider value={{
                currentlySelectedItem: selectedItem,
                allProductItems: currentProductsDataTree,
            }}>
                <div className="Products">
                    <div className="content">
                        <AttachedSideBar />

                        {isDashboard ? <TopActionButtonsView/> : null}
                        <MainContent />
                        <DetatchedSideBar functionsRef={detatchedSideBarfunctions}/>
                    </div>
                    <div
                        onClick={respondToSideBarButtonClicked}
                        className="side-bar-button">
                        {showSideBarIcon}
                    </div>
                </div>
            </ProductsDataContext.Provider>
        }} />
        <Route path="*" component={NotFoundPage} />
    </Switch>
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


function TopActionButtonsView(){
    
    return <div className="TopActionButtonsView">
        <TopActionButton svgIcon={homeIcon} title="go home" link={dashboardURL}/>
        <div className="right-buttons">
        {[
            {icon: plusIcon, title: "create new item"}, 
            {icon: editIcon, title: "edit current item"}, 
            {icon: trashIcon, isDestructive: true, title: "delete current item"},
        ].map((x, i) => <TopActionButton svgIcon={x.icon} isDestructive={x.isDestructive} title={x.title} key={i}/>)}
    </div>
    </div>
}



function TopActionButton(props: {svgIcon: React.ReactElement, isDestructive?: boolean, title: string, link?: string}){

    const className = "TopActionButton" + (props.isDestructive ?? false ? " destructive" : "");

    if (props.link){
        return <Link to={props.link} className={className}>
            {props.svgIcon}
        </Link>
    } else {
        return <button title={props.title} className={className}>
            {props.svgIcon}
        </button>
    }

    
}
