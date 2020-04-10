
import React, {useMemo, useRef, useEffect} from 'react';
import { NavLink, LinkProps, useLocation, Link } from 'react-router-dom';
import {Location } from 'history';

import productPageScssVariables from '../../_products-variables.scss';
import { ProductDataObject, isProductCategory, doesProductCategoryRecursivelyContainItem, isProduct, ProductCategory } from '../../ProductsDataHelpers';
import { useCurrentProductDetailsViewItem, useToURLForProductItem } from '../../ProductsUIHelpers';
import { Optional, useIsInitialRender } from 'jshelpers';
import { useSpring, animated, useTransition } from 'react-spring';

import './SideBarLinksNode.scss';

//TODO: checking the length of the children in SideBarLinksNode.tsx might not be enough for useMemo for shouldNodeBeExpanded
export default function SideBarLinksNode(props: { item: ProductDataObject }) {

    const currentlySelectedItem = useCurrentProductDetailsViewItem();

    const isInitialRender = useIsInitialRender();

    const desiredHeight = useMemo(() => {
        return getHeightForNodeElement(props.item, currentlySelectedItem)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.item.id, currentlySelectedItem?.id, (props.item as ProductCategory).children?.length]); 

    const _shouldNodeBeExpanded = useMemo(() => {
        return shouldNodeBeExpanded(props.item, currentlySelectedItem)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.item.id, currentlySelectedItem?.id, (props.item as ProductCategory).children?.length]); 

    const springNodeProps = useSpring({
        to: { height:  desiredHeight},
        immediate: isInitialRender,
    });


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
                        return componentProps.item.children.map(x => {
                            if (isProduct(x)) {
                                return <SideBarLink category={x} key={x.id.stringVersion} />;
                            } else {
                                // because without this, typescript starts freaking out
                                const category = x as ProductCategory;
                                return <SideBarLinksNode item={category} key={category.id.stringVersion} />;
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
        throw new Error("this point should not be reached!!");
    })();

    return heightAsNum + "px";
}




function SideBarLink(props: { category: ProductDataObject }) {
    const path = useToURLForProductItem(props.category)
    return <CustomNavLink to={path} className="SideBarLink" activeClassName="selected" shouldBeSelected={() => false}>
        <div className="title">{props.category.name}</div>
        <div className="chevron">›</div>
    </CustomNavLink>
}



function CustomNavLink(props: LinkProps & {shouldBeSelected: (currentLocation: Location) => boolean, activeClassName: string}){
    const currentLocation = useLocation();

    const shouldBeSelected = props.shouldBeSelected(currentLocation);

    const linkRef = useRef<Link<any>>(null);
    
    useEffect(() => {
        if (linkRef.current instanceof HTMLAnchorElement === false){return;}
        const anchorElement = linkRef.current as unknown as HTMLAnchorElement;
        if (shouldBeSelected){
            anchorElement.classList.add(props.activeClassName);
        } else {
            anchorElement.classList.remove(props.activeClassName);
        }
    }, [shouldBeSelected]);

    const linkProps = (() => {
        const x = {...props};
        // because react router automatically places all props into the anchor element itself, which causes errors from react.
        delete x.shouldBeSelected; delete x.activeClassName; 
        return x;
    })()
    
    return<Link ref={linkRef} {...linkProps}/>

}


