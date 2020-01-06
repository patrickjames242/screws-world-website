
import React, { useEffect } from 'react';
import './Products.scss';
import { Optional, useSetTitleFunctionality } from 'jshelpers';
import { ProductDataObject, productsDataTree, getDataObjectForID } from './ProductsData';
import { useRouteMatch, Switch, Route, useHistory } from 'react-router-dom';
import NotFoundPage from 'random-components/NotFoundPage/NotFoundPage';
import { useSpring } from 'react-spring';
import showSideBarIcon from './icons/showSideBarIcon';
import AttachedSideBar from './SideBar/AttachedSideBar';
import {ProductsDataContext } from './ProductsData';

import MainContent from './MainContent/MainContent';



export default function Products() {

    useSetTitleFunctionality("Products");

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

    return <Switch>
        <Route path={[currentURL, currentURL + "/:id"]} exact render={() => {
            return <ProductsDataContext.Provider value={{
                currentlySelectedItem: selectedItem,
                allProductItems: currentProductsDataTree,
            }}>
                <div className="Products">
                    <div className="content">
                        <AttachedSideBar />
                        <MainContent />
                    </div>
                    <div className="side-bar-button">
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
                // because typescript doesn't wanna cooperate
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

