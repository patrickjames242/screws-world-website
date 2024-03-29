import { useScreenDimmerFunctions } from "App/ScreenDimmer";
import { Location } from "history";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { animated, useTransition } from "react-spring";
import xIcon from "../../icons/xIcon";
import { isProduct } from "../../ProductsDataHelpers";
import {
  useAllTopLevelProductItems,
  useCurrentProductDetailsViewItem,
  useProductsInfoContextValue,
} from "../../ProductsUIHelpers";
import productsScssVariables from "../../_products-variables.module.scss";
import SideBarLinksNode from "../SideBarLinksNode/SideBarLinksNode";
import SideBarLoadingIndicator from "../SideBarLoadingIndicator/SideBarLoadingIndicator";
import "./DetachedSideBar.scss";

export interface DetatchedSideBarFunctionsRef {
  setIsPresented?: (isPresented: boolean, isAnimated: boolean) => void;
  isPresented?: boolean;
}

const minWidthForAttatchedSideBarMediaQuery = window.matchMedia(
  `(min-width: ${productsScssVariables.minWidthForDisplayingSideBar})`
);

export default function DetatchedSideBar(props: {
  functionsRef: DetatchedSideBarFunctionsRef;
}) {
  const [isPresented, setIsPresented] = useState(false);
  const shouldIsPresentedUpdateBeAnimatedRef = useRef(true);

  const dimmer = useScreenDimmerFunctions();

  const _setIsPresented = useCallback(
    function (isPresented: boolean, isAnimated: boolean) {
      shouldIsPresentedUpdateBeAnimatedRef.current = isAnimated;
      dimmer.setVisibility?.(isPresented, isAnimated);

      // screenDimmerFunctions.setScreenDimmerVisibility(isPresented, isAniamted);
      setIsPresented(isPresented);
    },
    [dimmer]
  );

  props.functionsRef.isPresented = isPresented;
  props.functionsRef.setIsPresented = _setIsPresented;

  useEffect(() => {
    if (isPresented === false) {
      return;
    }
    const unListen = dimmer.dimmerWasClickedNotification?.addListener?.(() => {
      _setIsPresented(false, true);
    });
    if (unListen) {
      return unListen;
    }
  }, [isPresented, dimmer, _setIsPresented]);

  useEffect(() => {
    if (isPresented === false) {
      return;
    }
    function listener(event: MediaQueryListEvent) {
      if (event.matches === false) {
        return;
      }
      _setIsPresented(false, false);
    }
    minWidthForAttatchedSideBarMediaQuery.addListener(listener);
    return () => minWidthForAttatchedSideBarMediaQuery.removeListener(listener);
  }, [isPresented, _setIsPresented]);

  const currentlySelectedItem = useCurrentProductDetailsViewItem();
  const prevLocationRef = useRef<Location>();
  const location = useLocation();

  useEffect(() => {
    if (prevLocationRef.current?.key === location.key) {
      return;
    }
    if (isProduct(currentlySelectedItem) && isPresented) {
      _setIsPresented(false, true);
    }
    prevLocationRef.current = location;
  });

  function respondToDismissButtonClicked() {
    _setIsPresented(false, true);
  }

  const transitionProps = useTransition(isPresented, {
    from: { transform: "translateX(-15rem)", opacity: 0 },
    enter: { transform: "translateX(0rem)", opacity: 1 },
    leave: { transform: "translateX(-15rem)", opacity: 0 },
    config: { friction: 17, tension: 170 },
    immediate: !shouldIsPresentedUpdateBeAnimatedRef.current,
  });

  const productsDataTree = useAllTopLevelProductItems();
  const productInfo = useProductsInfoContextValue();

  return (
    <>
      {transitionProps((style, item, _, index) => {
        if (item === false) {
          return null;
        }
        return (
          <animated.div
            key={index}
            className="DetatchedSideBar SideBar"
            style={style}
          >
            <div className="content">
              <div className="links-container-holder">
                {(() => {
                  if (productInfo.loadingIsFinished === false) {
                    return <SideBarLoadingIndicator />;
                  }
                })()}
                <div className="links-container">
                  {productsDataTree.map((x) => {
                    return (
                      <SideBarLinksNode item={x} key={x.id.stringVersion} />
                    );
                  })}
                </div>
              </div>
              <div
                className="dismiss-button"
                onClick={respondToDismissButtonClicked}
              >
                {xIcon}
              </div>
            </div>
          </animated.div>
        );
      })}
    </>
  );
}
