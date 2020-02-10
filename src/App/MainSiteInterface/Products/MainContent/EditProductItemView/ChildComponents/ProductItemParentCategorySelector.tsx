
import React, { useMemo } from 'react';
import {Optional} from 'jshelpers';
import { ProductDataObject, ProductCategory } from 'App/MainSiteInterface/Products/ProductsDataHelpers';
import { OptionalDatabaseValue, FieldTitles } from '../commonStuff';
import { useProductsInfoContextValue } from 'App/MainSiteInterface/Products/ProductsUIHelpers';
import CustomSelect, { CustomSelectChild } from 'random-components/CustomInputs/CustomSelect/CustomSelect';

export default function ProductItemParentCategorySelector(props: {
    isEnabled: boolean,
    itemBeingEdited: Optional<ProductDataObject>,
    value: OptionalDatabaseValue<number>,
    onValueChange: (newValue: OptionalDatabaseValue<number>) => void,
}) {

    const NULL_PARENT_CATEGORY_ID = -1;

    const productsInfoConstextValue = useProductsInfoContextValue();

    const allCategories = productsInfoConstextValue.data?.allCategories ?? [];

    const customSelectChildren = useMemo(() => {
        let children: CustomSelectChild[] = [];

        allCategories.forEach(x => {
            if (x.id.databaseID === props.itemBeingEdited?.id.databaseID) { return; }

            const title = (function getRecursiveTitleFor(category: ProductCategory): string {
                const titleItems = [category.name];
                if (category.parent != null) {
                    titleItems.unshift(getRecursiveTitleFor(category.parent));
                }
                return titleItems.join(", ");
            })(x);

            children.push({ uniqueID: String(x.id.databaseID), stringValue: title });
        });
        children = children.sort((x1, x2) => x1.stringValue.localeCompare(x2.stringValue));
        children.unshift({ uniqueID: String(NULL_PARENT_CATEGORY_ID), stringValue: "None (should be top level)" });
        return children;
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productsInfoConstextValue, props.itemBeingEdited]);


    function respondToValueDidChange(stringValue: string) {

        const newValue = (() => {
            if (stringValue === "") {
                return undefined;
            }
            const num = Number(stringValue);
            if (isNaN(num)) {
                throw new Error("this should be valid! Check logic");
            }
            if (num === NULL_PARENT_CATEGORY_ID) {
                return null;
            } else {
                return num;
            }
        })();

        props.onValueChange(newValue);
    }

    const value = (() => {
        if (props.value === undefined) {
            return "";
        } else if (props.value === null) {
            return String(NULL_PARENT_CATEGORY_ID);
        } else {
            return String(props.value);
        }
    })();


    return <CustomSelect isEnabled={props.isEnabled} topText={FieldTitles.parentCategory} value={value} placeholderText="What is the parent category?" onValueChange={respondToValueDidChange}>
        {customSelectChildren}
    </CustomSelect>
}