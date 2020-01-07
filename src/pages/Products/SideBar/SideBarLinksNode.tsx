
import React from 'react';
import { NavLink } from 'react-router-dom';
import productPageScssVariables from '../_products-variables.scss';
import { ProductDataObject, isProductCategory, doesProductCategoryRecursivelyContainItem, isProduct } from '../ProductsData';
import { useCurrentlySelectedItem, getToURLForProductsItem } from '../ProductsData';
import { Optional, useIsInitialRender } from 'jshelpers';
import { useSpring, animated, useTransition } from 'react-spring';



export default function SideBarLinksNode(props: { item: ProductDataObject }) {

    const currentlySelectedItem = useCurrentlySelectedItem();

    const isInitialRender = useIsInitialRender();

    const springNodeProps = useSpring({
        to: { height: getHeightForNodeElement(props.item, currentlySelectedItem) },
        immediate: isInitialRender,
    });

    const _shouldNodeBeExpanded = shouldNodeBeExpanded(props.item, currentlySelectedItem);

    const transitionItems = useTransition(_shouldNodeBeExpanded, null, {
        from: { opacity: 0, transform: "translateX(75px)", },
        enter: { opacity: 1, transform: "translateX(0px)" },
        leave: { opacity: 0, transform: "translateX(75px)" },
        immediate: isInitialRender,
    });

    const componentProps = props;

    return <animated.div className="SideBarLinksNode" style={springNodeProps}>
        <SideBarLink category={props.item} />

        {transitionItems.map(({ item, key, props }) => {
            if (item === false) { return null; }
            return <animated.div style={props} key={key} className="children-holder">
                {(() => {
                    if (isProductCategory(componentProps.item)) {
                        return componentProps.item.children.map((x, i) => {
                            if (isProduct(x)) {
                                return <SideBarLink category={x} key={i} />
                            } else {
                                return <SideBarLinksNode item={x} key={i} />
                            }
                        })
                    } else { return null; }
                
                })()}
            </animated.div>
        })}

    </animated.div>
}

function shouldNodeBeExpanded(nodeItem: ProductDataObject, currentlySelectedItem: Optional<ProductDataObject>): boolean {
    if (currentlySelectedItem == null || isProduct(nodeItem)) {
        return false;
    } else if (isProductCategory(nodeItem)) {
        return doesProductCategoryRecursivelyContainItem(currentlySelectedItem, nodeItem);
    }
    return false;
}

function getHeightForNodeElement(nodeItem: ProductDataObject, currentlySelectedItem: Optional<ProductDataObject>): string {

    const linkHeight = Number(productPageScssVariables.sideBarLinkHeight);
    const linksSpacing = Number(productPageScssVariables.sideBarLinkSpacing);

    const heightAsNum = (() => {
        if (currentlySelectedItem == null || isProduct(nodeItem)) {
            return linkHeight;
        } else if (isProductCategory(nodeItem)) {
            return (function getHeightForNodeItem(nodeItem: ProductDataObject): number {

                if (isProductCategory(nodeItem) &&
                    doesProductCategoryRecursivelyContainItem(currentlySelectedItem, nodeItem)) {
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
    })();
    return heightAsNum + "rem";
}


function SideBarLink(props: { category: ProductDataObject }) {
    const path = getToURLForProductsItem(props.category)
    return <NavLink exact strict to={path} className="SideBarLink" activeClassName="selected">
        <div className="title">{props.category.name}</div>
        <div className="chevron">›</div>
    </NavLink>
}


