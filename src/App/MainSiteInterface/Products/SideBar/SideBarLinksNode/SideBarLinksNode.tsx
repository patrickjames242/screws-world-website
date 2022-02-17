import { Location } from "history";
import { Optional, useIsInitialRender } from "jshelpers";
import React, { useEffect, useMemo, useRef } from "react";
import { Link, LinkProps, useLocation } from "react-router-dom";
import { animated, useSpring, useTransition } from "react-spring";
import {
  doesProductCategoryRecursivelyContainItem,
  isProduct,
  isProductCategory,
  ProductCategory,
  ProductDataObject,
} from "../../ProductsDataHelpers";
import { DashboardProductsRouteURLs } from "../../ProductsRoutesInfo";
import {
  ProductsPageSubjectType,
  useCurrentProductsPageSubject,
  useToURLForProductItem,
} from "../../ProductsUIHelpers";
import productPageScssVariables from "../../_products-variables.module.scss";
import "./SideBarLinksNode.scss";

//TODO: checking the length of the children in SideBarLinksNode.tsx might not be enough for useMemo for shouldNodeBeExpanded
export default function SideBarLinksNode(props: { item: ProductDataObject }) {
  const currentItemToBeSelected = (() => {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    const currentSubject = useCurrentProductsPageSubject();

    switch (currentSubject?.type) {
      case ProductsPageSubjectType.EDIT_ITEM:
      case ProductsPageSubjectType.PRODUCT:
      case ProductsPageSubjectType.CATEGORY:
        if (currentSubject.associatedData instanceof ProductDataObject) {
          return currentSubject.associatedData;
        }
      //eslint-disable-next-line no-fallthrough
      default:
        return null;
    }
  })();

  const isInitialRender = useIsInitialRender();

  const desiredHeight = useMemo(() => {
    return getHeightForNodeElement(props.item, currentItemToBeSelected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.item.id,
    currentItemToBeSelected?.id,
    (props.item as ProductCategory).children?.length,
  ]);

  const _shouldNodeBeExpanded = useMemo(() => {
    return shouldNodeBeExpanded(props.item, currentItemToBeSelected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.item.id,
    currentItemToBeSelected?.id,
    (props.item as ProductCategory).children?.length,
  ]);

  const springNodeProps = useSpring({
    to: { height: desiredHeight },
    immediate: isInitialRender,
  });

  const transitionItems = useTransition(_shouldNodeBeExpanded, {
    from: { opacity: 0, transform: "translateX(75px)" },
    enter: { opacity: 1, transform: "translateX(0px)" },
    leave: { opacity: 0, transform: "translateX(75px)" },
    immediate: isInitialRender,
  });

  const componentProps = props;

  return (
    <animated.div className="SideBarLinksNode" style={springNodeProps}>
      <SideBarLink item={props.item} />

      {transitionItems((styles, item, _, index) => {
        if (item === false) {
          return null;
        }
        return (
          <animated.div style={styles} key={index} className="children-holder">
            {(() => {
              if (isProductCategory(componentProps.item)) {
                return componentProps.item.children.map((x) => {
                  if (isProduct(x)) {
                    return <SideBarLink item={x} key={x.id.stringVersion} />;
                  } else if (isProductCategory(x)) {
                    // because without this, typescript thinks x is of type never... for some stuipd, idiotic reason
                    const category = x as ProductCategory;
                    return (
                      <SideBarLinksNode
                        item={category}
                        key={category.id.stringVersion}
                      />
                    );
                  } else {
                    throw new Error(
                      "this point should not be reached!! Fix it!!"
                    );
                  }
                });
              } else {
                return null;
              }
            })()}
          </animated.div>
        );
      })}
    </animated.div>
  );
}

function shouldNodeBeExpanded(
  nodeItem: ProductDataObject,
  currentlySelectedItem: Optional<ProductDataObject>
): boolean {
  if (currentlySelectedItem == null || isProduct(nodeItem)) {
    return false;
  } else if (isProductCategory(nodeItem)) {
    return doesProductCategoryRecursivelyContainItem(
      currentlySelectedItem,
      nodeItem
    );
  }
  return false;
}

function getHeightForNodeElement(
  nodeItem: ProductDataObject,
  currentlySelectedItem: Optional<ProductDataObject>
): string {
  const linkHeight = Number(productPageScssVariables.sideBarLinkHeight);
  const linksSpacing = Number(productPageScssVariables.sideBarLinkSpacing);

  const heightAsNum = (() => {
    if (currentlySelectedItem == null || isProduct(nodeItem)) {
      return linkHeight;
    } else if (isProductCategory(nodeItem)) {
      return (function getHeightForNodeItem(
        nodeItem: ProductDataObject
      ): number {
        if (
          isProductCategory(nodeItem) &&
          doesProductCategoryRecursivelyContainItem(
            currentlySelectedItem,
            nodeItem
          )
        ) {
          let height = linkHeight;
          for (const child of nodeItem.children) {
            height += linksSpacing + getHeightForNodeItem(child);
          }
          return height;
        } else {
          return linkHeight;
        }
      })(nodeItem);
    }
    throw new Error("this point should not be reached!!");
  })();

  return heightAsNum + "px";
}

function SideBarLink(props: { item: ProductDataObject }) {
  const productItemPath = useToURLForProductItem(props.item);
  const productItemEditingPath = DashboardProductsRouteURLs.editProductItem(
    props.item.id
  );

  const currentLocation = useLocation();

  function shouldBeSelected() {
    return (
      productItemEditingPath === currentLocation.pathname ||
      currentLocation.pathname === productItemPath
    );
  }

  return (
    <CustomNavLink
      to={productItemPath}
      className="SideBarLink"
      activeClassName="selected"
      shouldBeSelected={shouldBeSelected}
    >
      <div className="title">{props.item.name}</div>
      <div className="chevron">›</div>
    </CustomNavLink>
  );
}

function CustomNavLink({
  shouldBeSelected,
  activeClassName,
  ...linkProps
}: LinkProps & {
  shouldBeSelected: (currentLocation: Location) => boolean;
  activeClassName: string;
}) {
  const currentLocation = useLocation();

  const _shouldBeSelected = shouldBeSelected(currentLocation);

  const linkRef = useRef<Link<any>>(null);

  useEffect(() => {
    if (linkRef.current instanceof HTMLAnchorElement === false) {
      return;
    }
    const anchorElement = linkRef.current as unknown as HTMLAnchorElement;
    if (_shouldBeSelected) {
      anchorElement.classList.add(activeClassName);
    } else {
      anchorElement.classList.remove(activeClassName);
    }
  }, [shouldBeSelected, activeClassName, _shouldBeSelected]);

  return <Link ref={linkRef as any} {...linkProps} />;
}
