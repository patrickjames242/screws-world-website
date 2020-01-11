
import React, { useState, useRef, useCallback, useEffect } from 'react';
import xIcon from '../icons/xIcon';

import { useAppHelpers } from 'App/AppUIHelpers';
import { useTransition, animated } from 'react-spring';

import productsScssVariables from '../_products-variables.scss';
import { useAllProductItems } from '../ProductsUIHelpers';
import SideBarLinksNode from './SideBarLinksNode';


export interface DetatchedSideBarFunctionsRef {
    setIsPresented?: (isPresented: boolean, isAnimated: boolean) => void;
    isPresented?: boolean;
}

const minWidthForAttatchedSideBarMediaQuery = window.matchMedia(`(min-width: ${productsScssVariables.minWidthForDisplayingSideBar})`);

export default function DetatchedSideBar(props: { functionsRef: DetatchedSideBarFunctionsRef }) {

    const [isPresented, setIsPresented] = useState(false);
    const shouldIsPresentedUpdateBeAnimatedRef = useRef(true);

    const appHelpers = useAppHelpers();

    const _setIsPresented = useCallback(function (isPresented: boolean, isAniamted: boolean) {
        shouldIsPresentedUpdateBeAnimatedRef.current = isAniamted;
        appHelpers.screenDimmer.setScreenDimmerVisibility(isPresented, isAniamted);
        setIsPresented(isPresented);
    }, [appHelpers.screenDimmer]);

    props.functionsRef.isPresented = isPresented;
    props.functionsRef.setIsPresented = _setIsPresented;

    useEffect(() => {
        if (isPresented === false) { return; }
        const unListen = appHelpers.screenDimmer.screenDimmerDidDismissNotification.addListener(() => {
            _setIsPresented(false, true);
        });
        return unListen;
    }, [isPresented, appHelpers.screenDimmer.screenDimmerDidDismissNotification, _setIsPresented]);

    useEffect(() => {
        if (isPresented === false) { return; }
        function listener(event: MediaQueryListEvent) {
            if (event.matches === false) { return; }
            _setIsPresented(false, false);
        }

        minWidthForAttatchedSideBarMediaQuery.addListener(listener);
        return () => minWidthForAttatchedSideBarMediaQuery.removeListener(listener);
    }, [isPresented, _setIsPresented]);

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

    const productsDataTree = useAllProductItems();


    return <>
        {transitionProps.map(({ item, key, props }) => {
            if (item === false) { return null; }
            return <animated.div key={key} className="DetatchedSideBar SideBar" style={props}>
                <div className="content">
                    <div className="links-container-holder">
                        <div className="links-container">
                            {productsDataTree.map(x => {
                                return <SideBarLinksNode item={x} key={x.id} />
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






