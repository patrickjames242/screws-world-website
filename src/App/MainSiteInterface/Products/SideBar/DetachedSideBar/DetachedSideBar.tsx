
import React, { useState, useRef, useCallback, useEffect } from 'react';
import xIcon from '../../icons/xIcon';


import { useTransition, animated } from 'react-spring';
import { useLocation } from 'react-router-dom';
import {Location} from 'history';

import { useAllTopLevelProductItems, useCurrentProductDetailsViewItem } from '../../ProductsUIHelpers';
import SideBarLinksNode from '../SideBarLinksNode/SideBarLinksNode';
import { isProduct } from '../../ProductsDataHelpers';
import productsScssVariables from '../../_products-variables.scss';
import { callIfPossible } from 'jshelpers';

import './DetachedSideBar.scss';
import { useScreenDimmerFunctions } from 'App/ScreenDimmer';


export interface DetatchedSideBarFunctionsRef {
    setIsPresented?: (isPresented: boolean, isAnimated: boolean) => void;
    isPresented?: boolean;
}

const minWidthForAttatchedSideBarMediaQuery = window.matchMedia(`(min-width: ${productsScssVariables.minWidthForDisplayingSideBar})`);

export default function DetatchedSideBar(props: { functionsRef: DetatchedSideBarFunctionsRef }) {

    const [isPresented, setIsPresented] = useState(false);
    const shouldIsPresentedUpdateBeAnimatedRef = useRef(true);

    const dimmer = useScreenDimmerFunctions();

    const _setIsPresented = useCallback(function (isPresented: boolean, isAnimated: boolean) {
        shouldIsPresentedUpdateBeAnimatedRef.current = isAnimated;
        callIfPossible(dimmer.setVisibility, isPresented, isAnimated);

        // screenDimmerFunctions.setScreenDimmerVisibility(isPresented, isAniamted);
        setIsPresented(isPresented);
    }, [dimmer]);

    props.functionsRef.isPresented = isPresented;
    props.functionsRef.setIsPresented = _setIsPresented;

    useEffect(() => {
        if (isPresented === false) { return; }
        const unListen = callIfPossible(dimmer.dimmerWasClickedNotification?.addListener, () => {
            _setIsPresented(false, true);
        });
        if (unListen){return unListen;}
    }, [isPresented, dimmer, _setIsPresented]);

    useEffect(() => {
        if (isPresented === false) { return; }
        function listener(event: MediaQueryListEvent) {
            if (event.matches === false) { return; }
            _setIsPresented(false, false);
        }
        minWidthForAttatchedSideBarMediaQuery.addListener(listener);
        return () => minWidthForAttatchedSideBarMediaQuery.removeListener(listener);
    }, [isPresented, _setIsPresented]);

    const currentlySelectedItem = useCurrentProductDetailsViewItem();
    const prevLocationRef = useRef<Location>();
    const location = useLocation();

    useEffect(() => {
        if (prevLocationRef.current?.key === location.key){return;}
        if (isProduct(currentlySelectedItem) && isPresented) {
            _setIsPresented(false, true);
        }
        prevLocationRef.current = location;
    });


    function respondToDismissButtonClicked() {
        _setIsPresented(false, true);
    }

    const transitionProps = useTransition(isPresented, null, {
        from: { transform: "translateX(-15rem)", opacity: 0 },
        enter: { transform: "translateX(0rem)", opacity: 1 },
        leave: { transform: "translateX(-15rem)", opacity: 0 },
        config: { friction: 17, tension: 170 },
        immediate: !shouldIsPresentedUpdateBeAnimatedRef.current,
    });

    const productsDataTree = useAllTopLevelProductItems();


    return <>
        {transitionProps.map(({ item, key, props }) => {
            if (item === false) { return null; }
            return <animated.div key={key} className="DetatchedSideBar SideBar" style={props}>
                <div className="content">
                    <div className="links-container-holder">
                        <div className="links-container">
                            {productsDataTree.map(x => {
                                return <SideBarLinksNode item={x} key={x.uniqueProductItemID} />
                            })}
                        </div>
                    </div>
                    <div className="dismiss-button" onClick={respondToDismissButtonClicked}>
                        {xIcon}
                    </div>
                </div>

            </animated.div>
        })}
    </>;
}






