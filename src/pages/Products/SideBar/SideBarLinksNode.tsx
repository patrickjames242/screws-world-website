
import React from 'react';
import { NavLink } from 'react-router-dom';
import productPageScssVariables from '../_products-variables.scss';
import { ProductDataObject, isProductCategory, doesProductCategoryRecursivelyContainItem, isProduct, ProductCategory } from '../ProductsData';
import { useCurrentlySelectedItem, getToURLForProductsItem } from '../ProductsData';
import { Optional } from 'jshelpers';
import { useSpring, animated } from 'react-spring';




export default function SideBarLinksNode(props: { item: ProductDataObject }) {

    const currentlySelectedItem = useCurrentlySelectedItem();

    // const shouldBeExpanded = (() => {
    //     if (currentlySelectedItem === null){return false;}
    //     return shouldNodeBeExpanded(props.item, currentlySelectedItem);
    // })(); 

    const springNodeProps = useSpring({
        to: { height: getHeightForNodeElement(props.item, currentlySelectedItem) },
    });

    const _shouldNodeBeExpanded = shouldNodeBeExpanded(props.item, currentlySelectedItem);

    const springChildrenOpacityProps = useSpring({
        opacity: _shouldNodeBeExpanded ? 1 : 0,
        transform: _shouldNodeBeExpanded ? "translateX(0px)" : "translateX(100px)",
        config: { friction: 30 },
    });

    return <animated.div className="SideBarLinksNode" style={springNodeProps}>
        <SideBarLink category={props.item} />

        {(() => {
            if (isProductCategory(props.item)) {
                return <animated.div style={springChildrenOpacityProps} className="children-holder">
                    {props.item.children.map((x, i) => {
                        return <SideBarLinksNode item={x} key={i} />
                    })}
                </animated.div>
            }
        })()}

    </animated.div>
}

function shouldNodeBeExpanded(nodeItem: ProductDataObject, currentlySelectedItem: Optional<ProductDataObject>): boolean {
    if (nodeItem.id === currentlySelectedItem?.id) {
        return true;
    } else if (isProductCategory(nodeItem)) {
        for (const child of nodeItem.children) {
            if (shouldNodeBeExpanded(child, currentlySelectedItem)) {
                return true;
            }
        }
    }

    return false;
}

function getHeightForNodeElement(nodeItem: ProductDataObject, currentlySelectedItem: Optional<ProductDataObject>): string {

    const linkHeight = Number(productPageScssVariables.sideBarLinkHeight);
    const linksSpacing = Number(productPageScssVariables.sideBarLinkSpacing);


    const heightAsNum = (() => {
        if (currentlySelectedItem == null || isProduct(nodeItem)) {
            return linkHeight;
        }

        if (doesProductCategoryRecursivelyContainItem(currentlySelectedItem, nodeItem as ProductCategory)) {
            return (function calculateHeightForNode(nodeItem: ProductDataObject): number {
                if (isProductCategory(nodeItem)) {
                    let height = linkHeight;
                    for (const child of nodeItem.children) {
                        height += linksSpacing + calculateHeightForNode(child);
                    }
                    return height;
                } else {
                    return linkHeight;
                }
            })(nodeItem);
        } else {
            return linkHeight;
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