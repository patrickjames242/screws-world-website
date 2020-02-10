
import {Optional} from 'jshelpers';
import { ProductDataObject, ProductDataType } from '../../ProductsDataHelpers';

export interface EditProductItemViewProps {
    itemToEdit: Optional<ProductDataObject>,
}


export const FieldTitles = {
    itemType: "Item Type",
    title: "Title",
    description: "Description",
    parentCategory: "Parent Category",
    image: "Image",
}




// undefined means no value should be pushed to server. null means current value in server database should be deleted.
export type OptionalDatabaseValue<Type> = Type | null | undefined;
export type RequiredDatabaseValue<Type> = Type | undefined;

export interface StateProps {
    itemType: RequiredDatabaseValue<ProductDataType>,
    parentCategoryID: OptionalDatabaseValue<number>,
    title: RequiredDatabaseValue<string>,
    description: OptionalDatabaseValue<string>,
    imageFile: OptionalDatabaseValue<File>,
}