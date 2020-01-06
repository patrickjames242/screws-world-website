
import React from 'react';
import { NavLink } from 'react-router-dom';

import { ProductDataObject, isProductCategory } from '../ProductsData';
import {useCurrentlySelectedItem, getToURLForProductsItem} from '../ProductsData';



export default function SideBarLinksNode(props: { item: ProductDataObject }) {
    
    const currentlySelectedItem = useCurrentlySelectedItem();

    const shouldBeExpanded = (() => {
        if (currentlySelectedItem === null){return false;}
        return shouldNodeBeExpanded(props.item, currentlySelectedItem);
    })(); 

    return <div className="SideBarLinksNode" style={{
        height: shouldBeExpanded ? "initial" : "45.41px",
    }}>
        <SideBarLink category={props.item} />
        {(() => {
            if (isProductCategory(props.item)) {
                return <div className="children-holder">
                    {props.item.children.map((x, i) => {
                        return <SideBarLinksNode item={x} key={i} />
                    })}
                </div>
            }
        })()}

    </div>
}

function shouldNodeBeExpanded(nodeItem: ProductDataObject, currentlySelectedItem: ProductDataObject): boolean{

    if (nodeItem.id === currentlySelectedItem.id){
        return true;
    } else if (isProductCategory(nodeItem)){
        for (const child of nodeItem.children){
            if (shouldNodeBeExpanded(child, currentlySelectedItem)){
                return true;
            }
        }
    }

    return false;
}


function SideBarLink(props: { category: ProductDataObject }) {
    const path = getToURLForProductsItem(props.category)
    return <NavLink exact strict to={path} className="SideBarLink" activeClassName="selected">
        <div className="title">{props.category.name}</div>
        <div className="chevron">›</div>
    </NavLink>
}