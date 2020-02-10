
import { Optional } from "jshelpers";
import { ProductDataObject, ProductDataType } from "App/MainSiteInterface/Products/ProductsDataHelpers";
import React from "react";
import CustomSelect from "random-components/CustomInputs/CustomSelect/CustomSelect";
import { RequiredDatabaseValue, FieldTitles } from "../commonStuff";




export default function ProductItemTypeSelector(props: {
    isEnabled: boolean,
    itemBeingEdited: Optional<ProductDataObject>,
    value: RequiredDatabaseValue<ProductDataType>,
    onValueChange: (newValue: RequiredDatabaseValue<ProductDataType>) => void,
}) {

    const { getStringForItemType, getItemTypeForString } = (() => {
        const productText = "Product";
        const categoryText = "Category";

        function getStringForItemType(type: ProductDataType): string {
            switch (type) {
                case ProductDataType.Product: return productText;
                case ProductDataType.ProductCategory: return categoryText;
            }
        }

        function getItemTypeForString(string: string): Optional<ProductDataType> {
            switch (string) {
                case productText: return ProductDataType.Product;
                case categoryText: return ProductDataType.ProductCategory;
                default: return null;
            }
        }

        return { getStringForItemType, getItemTypeForString };
    })();


    function respondToItemTypeDidChange(stringValue: string) {
        const newValue = (() => {
            if (stringValue === "") {
                return undefined;
            } else {
                const convertedItemType = getItemTypeForString(stringValue);
                if (convertedItemType == null) {
                    throw new Error("this isn't supposed to be null. Check the logic");
                }
                return convertedItemType;
            }
        })();
        props.onValueChange(newValue);
    }

    const value = (() => {
        return props.value !== undefined ? getStringForItemType(props.value) : "";
    })();

    return <>
        {(() => {
            if (props.itemBeingEdited == null) {
                return <CustomSelect isEnabled={props.isEnabled} topText={FieldTitles.itemType} value={value} placeholderText="Is this a product or category?" onValueChange={respondToItemTypeDidChange}>
                    {[ProductDataType.Product, ProductDataType.ProductCategory]
                        .map(x => {
                            const string = getStringForItemType(x);
                            return { uniqueID: string, stringValue: string };
                        })}
                </CustomSelect>
            } else {
                return null;
            }
        })()}
    </>
}
