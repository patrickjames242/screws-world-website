import "./EditProductItemView.scss";
import React, { useEffect, useState, useRef } from "react";
import {
  ProductsDataObjectID,
  ProductDataType,
} from "../../ProductsDataHelpers";
import { Optional, useBlockHistoryWhileMounted } from "jshelpers";
import { useHistory, useLocation } from "react-router-dom";
import { useRequestsRequiringAuth } from "App/Dashboard/DashboardUIHelpers";
import TextField, {
  CustomTextFieldType,
} from "random-components/CustomInputs/CustomTextField/CustomTextField";
import LoadingButton from "random-components/LoadingButton/LoadingButton";
import ErrorMessageBox from "random-components/ErrorMessageBox/ErrorMessageBox";
import { FetchItemType, ProductItemNetworkResponse } from "API";

import { DashboardProductsRouteURLs } from "../../ProductsRoutesInfo";
import ProductItemTypeSelector from "./ChildComponents/ProductItemTypeSelector";
import ProductItemParentCategorySelector from "./ChildComponents/ParentCategorySelector";
import {
  getDefaultUpdatePropertyStates,
  getAreThereChangesToBeSavedValue,
  getAPIUpdateObjectFromState,
  EditProductItemViewProps,
  StateProps,
  FieldTitles,
} from "./EditProductItemViewHelpers";
import ProductItemImageSelector from "./ChildComponents/ImageSelector/ImageSelector";

export default function EditProductItemView(props: EditProductItemViewProps) {
  const location = useLocation();

  const defaultStates = getDefaultUpdatePropertyStates(props, location);

  const [itemType, setItemType] = useState(defaultStates.itemType);
  const [parentCategoryID, setParentCategoryID] = useState(
    defaultStates.parentCategoryID
  );
  const [title, setTitle] = useState(defaultStates.title);
  const [description, setDescription] = useState(defaultStates.description);
  const [imageFile, setImageFile] = useState(defaultStates.imageFile);
  const [imageContentFitMode, setImageContentFitMode] = useState(
    defaultStates.imageContentFitMode
  );

  const currentPropertiesStates: StateProps = {
    itemType,
    parentCategoryID,
    title,
    description,
    imageFile,
    imageContentFitMode,
  };

  const [isLoading, setIsLoading] = useState(false);
  const [creationOrUpdateHasCompleted, setCreationOrUpdateHasCompleted] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState<Optional<string>>(null);

  useEffect(() => {
    const defaultStates = getDefaultUpdatePropertyStates(props, location);
    setItemType(defaultStates.itemType);
    setParentCategoryID(defaultStates.parentCategoryID);
    setTitle(defaultStates.title);
    setDescription(defaultStates.description);
    setImageFile(defaultStates.imageFile);
    setImageContentFitMode(defaultStates.imageContentFitMode);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.itemToEdit]);

  const history = useHistory();

  const changesState = getAreThereChangesToBeSavedValue(
    props,
    currentPropertiesStates,
    location
  );

  useBlockHistoryWhileMounted(
    "Are you sure you want to leave this page? If you do, all the changes you have made will be lost.",
    changesState.hasTheUserMadeChanges && creationOrUpdateHasCompleted === false
  );

  const apiRequests = useRequestsRequiringAuth();

  const apiRequestResult = useRef<
    Optional<{
      fetchItemType: FetchItemType;
      result: ProductItemNetworkResponse;
    }>
  >(null);

  function respondToFormSubmission(event: React.FormEvent<HTMLFormElement>) {
    if (isLoading) {
      return;
    }

    event.preventDefault();

    apiRequestResult.current = null;

    setErrorMessage(null);
    setIsLoading(true);

    let fetchItemType: FetchItemType;

    const promise = (() => {
      try {
        // if any values required for the api request are not provided, the below function call should throw an error that we will catch
        const objectProps = getAPIUpdateObjectFromState(
          props,
          currentPropertiesStates
        );
        fetchItemType = objectProps.fetchItemType;
        if (props.itemToEdit != null) {
          return apiRequests.editItem(
            objectProps.fetchItemType,
            props.itemToEdit.id.databaseID,
            objectProps
          );
        } else {
          return apiRequests.createNewItem(
            objectProps.fetchItemType,
            objectProps
          );
        }
      } catch (error) {
        return Promise.reject(error);
      }
    })();

    promise
      .finally(() => {
        setIsLoading(false);
      })
      .then((result) => {
        if (fetchItemType == null) {
          return;
        }
        apiRequestResult.current = { fetchItemType, result };
        setCreationOrUpdateHasCompleted(true);
      })
      .catch((error) => {
        setErrorMessage(error.message);
      });
  }

  useEffect(() => {
    if (creationOrUpdateHasCompleted === false || !apiRequestResult.current) {
      return;
    }

    if (props.itemToEdit) {
      history.goBack();
    } else {
      const dataType = getProductDataTypeForFetchItemType(
        apiRequestResult.current.fetchItemType
      );
      const id = new ProductsDataObjectID(
        apiRequestResult.current.result.id,
        dataType
      );
      history.replace(DashboardProductsRouteURLs.productDetailsView(id));
    }
  }, [creationOrUpdateHasCompleted, history, props.itemToEdit]);

  const submitButtonText =
    props.itemToEdit === null ? "Create" : "Save changes";

  const shouldFieldsBeEnabled = isLoading === false;

  return (
    <div className="EditProductItemView">
      <form className="container" onSubmit={respondToFormSubmission}>
        <ProductItemTypeSelector
          isEnabled={shouldFieldsBeEnabled}
          topText={FieldTitles.itemType}
          itemBeingEdited={props.itemToEdit}
          value={itemType}
          onValueChange={setItemType}
        />

        <ProductItemParentCategorySelector
          isEnabled={shouldFieldsBeEnabled}
          topText={FieldTitles.parentCategory}
          itemBeingEdited={props.itemToEdit}
          value={parentCategoryID}
          onValueChange={setParentCategoryID}
        />

        <TextField
          isEnabled={shouldFieldsBeEnabled}
          className="title"
          isRequired={true}
          topText={FieldTitles.title}
          placeholderText="What is the name of the item?"
          value={title ?? ""}
          onValueChange={setTitle}
        />

        <ProductItemImageSelector
          isEnabled={shouldFieldsBeEnabled}
          topText={FieldTitles.image}
          itemBeingEdited={props.itemToEdit}
          value={imageFile}
          onValueChange={setImageFile}
          imageFitModeProps={{
            value: imageContentFitMode,
            onChange: setImageContentFitMode,
          }}
        />

        <TextField
          isEnabled={shouldFieldsBeEnabled}
          className="description"
          topText={FieldTitles.description}
          placeholderText="Give some information on the item."
          type={CustomTextFieldType.MultipleLine}
          value={description ?? ""}
          onValueChange={setDescription}
        />

        {errorMessage ? <ErrorMessageBox errorMessage={errorMessage} /> : null}

        <LoadingButton
          isActive={changesState.areThereChangesToBeSaved}
          className="submit-button"
          loadingIndicatorSize="1.8rem"
          shouldShowIndicator={isLoading}
        >
          {submitButtonText}
        </LoadingButton>
      </form>
    </div>
  );
}

function getProductDataTypeForFetchItemType(
  fetchItemType: FetchItemType
): ProductDataType {
  switch (fetchItemType) {
    case FetchItemType.PRODUCT:
      return ProductDataType.Product;
    case FetchItemType.CATEGORY:
      return ProductDataType.ProductCategory;
  }
}
