import { Optional, Notification } from "jshelpers";

enum HTTPMethod {
  GET,
  POST,
  PUT,
  DELETE,
}

enum BodyInfoContentType {
  JSON,
  AUTO,
}

interface BodyInfo {
  data: any;
  type: BodyInfoContentType;
}

interface FetchDataFromAPIProps {
  url: string;
  method?: HTTPMethod;
  bodyInfo?: BodyInfo;
  headers?: Map<string, string>;
}

class APIRequestError extends Error {
  constructor(message: string, readonly errorCode: number) {
    super(message);
  }
}

async function fetchDataFromAPI<ResultType>(
  props: FetchDataFromAPIProps
): Promise<ResultType> {
  const method = (() => {
    switch (props.method ?? HTTPMethod.GET) {
      case HTTPMethod.GET:
        return "GET";
      case HTTPMethod.POST:
        return "POST";
      case HTTPMethod.PUT:
        return "PUT";
      case HTTPMethod.DELETE:
        return "DELETE";
      default:
        throw new Error("the http method value provided is not valid");
    }
  })();

  const headers = (() => {
    const x: { [key: string]: string } = {};

    if (props.bodyInfo) {
      switch (props.bodyInfo.type) {
        case BodyInfoContentType.JSON:
          x["Content-Type"] = "application/json";
          break;
        case BodyInfoContentType.AUTO:
          // we allow the browser to set the content type for us
          break;
      }
    }

    for (const key of props.headers?.keys() ?? []) {
      const value = props.headers?.get(key);
      if (value) {
        x[key] = value;
      }
    }

    return x;
  })();

  const body = (() => {
    if (props.bodyInfo == null) {
      return undefined;
    }
    switch (props.bodyInfo.type) {
      case BodyInfoContentType.JSON:
        return JSON.stringify(props.bodyInfo.data);
      case BodyInfoContentType.AUTO:
        return props.bodyInfo.data;
    }
  })();

  const fetchResult = await fetch(props.url, {
    method,
    headers,
    body,
  });

  const resultJsonBody = (await fetchResult.json()) as any;

  if (resultJsonBody.status === "success") {
    return resultJsonBody.data;
  } else if (
    resultJsonBody.status === "failure" &&
    resultJsonBody.errorMessage != null
  ) {
    return Promise.reject(
      new APIRequestError(resultJsonBody.errorMessage, fetchResult.status)
    );
  } else {
    return Promise.reject(new Error("An unknown error occured."));
  }
}

export enum FetchItemType {
  CATEGORY,
  PRODUCT,
}

function urlForFetchItemType(fetchItemType: FetchItemType): string {
  switch (fetchItemType) {
    case FetchItemType.CATEGORY:
      return categoriesURL;
    case FetchItemType.PRODUCT:
      return productsURL;
  }
}

const baseURL = "https://screws-world.herokuapp.com";
// const baseURL = "http://localhost:5000";

const categoriesURL = baseURL + "/categories";
const productsURL = baseURL + "/products";

export interface LoginRequestResult {
  readonly authToken: string;
}

export async function logIn(
  username: string,
  password: string
): Promise<LoginRequestResult> {
  const bodyInfo: BodyInfo = {
    type: BodyInfoContentType.JSON,
    data: { username, password },
  };
  return fetchDataFromAPI({
    url: baseURL + "/login",
    method: HTTPMethod.POST,
    bodyInfo,
  });
}

export interface ProductItemNetworkResponse {
  id: number;
  title: string;
  description: Optional<string>;
  parent_category: Optional<number>;
  image_url: Optional<string>;
  image_content_fit_mode: string;
}

export async function fetchAllItems(
  itemType: FetchItemType
): Promise<ProductItemNetworkResponse[]> {
  return fetchDataFromAPI({ url: urlForFetchItemType(itemType) });
}

export interface APIEmailMessageProps {
  contact_email: string;
  name: string;
  subject: string;
  description: string;
}

export async function sendEmailMessage(
  props: APIEmailMessageProps
): Promise<null> {
  const bodyInfo: BodyInfo = {
    type: BodyInfoContentType.JSON,
    data: props,
  };
  return fetchDataFromAPI({
    url: baseURL + "/email",
    method: HTTPMethod.POST,
    bodyInfo,
  });
}

export enum ProductImageContentFitMode {
  fit,
  fill,
}

export const ProductItemContentFitMode_Helpers = (() => {
  const fit = "fit",
    fill = "fill";

  return {
    get default(): ProductImageContentFitMode {
      return ProductImageContentFitMode.fill;
    },
    getFromString(string: string): ProductImageContentFitMode {
      switch (string) {
        case fit:
          return ProductImageContentFitMode.fit;
        case fill:
          return ProductImageContentFitMode.fill;
        default:
          throw new Error(
            "the product item content fit mode string is invalid."
          );
      }
    },
    convertToString(fitMode: ProductImageContentFitMode): string {
      switch (fitMode) {
        case ProductImageContentFitMode.fit:
          return fit;
        case ProductImageContentFitMode.fill:
          return fill;
      }
    },
  };
})();

export interface ProductItemProps {
  title?: string;
  description?: Optional<string>;
  parentCategoryID?: Optional<number>;
  image?: Optional<File>;
  imageContentFitMode?: ProductImageContentFitMode;
}

export enum APIChangeType {
  DELETE,
  UPDATE,
  INSERTION,
}

export class APIChange {
  constructor(
    readonly type: APIChangeType,
    readonly itemType: FetchItemType,
    // the number is the id of the object. It is used when the object has been deleted
    readonly info: ProductItemNetworkResponse | number
  ) {}
}

export const apiInfoDidChangeNotification = new Notification<APIChange>();

export class RequestsRequiringAuthentication {
  constructor(private readonly authTokenProvider: () => Optional<string>) {}

  async createNewItem(
    itemType: FetchItemType,
    props: ProductItemProps
  ): Promise<ProductItemNetworkResponse> {
    const bodyInfo = this.getItemUpdateBodyInfoForProductItemProps(props);
    let result =
      await this.performRequestRequiringAuth<ProductItemNetworkResponse>({
        url: urlForFetchItemType(itemType),
        method: HTTPMethod.POST,
        bodyInfo,
      });
    if (props.image !== undefined) {
      if (props.image)
        result = await this.updateImageForItem(
          itemType,
          result.id,
          props.image
        );
    }
    apiInfoDidChangeNotification.post(
      new APIChange(APIChangeType.INSERTION, itemType, result)
    );
    return result;
  }

  /**
   * Only add properties to the props object that you want to be updated. If the value of a property is null, it will be sent to the server, if the value is undefined, the property will be ignored.
   */

  async editItem(
    itemType: FetchItemType,
    id: number,
    props: ProductItemProps
  ): Promise<ProductItemNetworkResponse> {
    const url = urlForFetchItemType(itemType) + "/" + id;
    const bodyInfo = this.getItemUpdateBodyInfoForProductItemProps(props); // when the props object is converted to a json string, the undefined properties will be removed automatically
    let networkResult =
      await this.performRequestRequiringAuth<ProductItemNetworkResponse>({
        url,
        bodyInfo,
        method: HTTPMethod.PUT,
      });
    if (props.image !== undefined) {
      if (props.image === null) {
        networkResult = await this.deleteImageForItem(
          itemType,
          networkResult.id
        );
      } else if (props.image instanceof File) {
        networkResult = await this.updateImageForItem(
          itemType,
          networkResult.id,
          props.image
        );
      }
    }
    apiInfoDidChangeNotification.post(
      new APIChange(APIChangeType.UPDATE, itemType, networkResult)
    );
    return networkResult;
  }

  private getItemUpdateBodyInfoForProductItemProps(
    props: ProductItemProps
  ): BodyInfo {
    return {
      type: BodyInfoContentType.JSON,
      data: {
        title: props.title,
        description: props.description,
        parent_category: props.parentCategoryID,
        image_content_fit_mode: (() => {
          if (props.imageContentFitMode != null) {
            return ProductItemContentFitMode_Helpers.convertToString(
              props.imageContentFitMode
            );
          } else {
            return undefined;
          }
        })(),
      },
    };
  }

  async deleteItem(itemType: FetchItemType, id: number): Promise<null> {
    const result = await this.performRequestRequiringAuth<null>({
      url: urlForFetchItemType(itemType) + "/" + id,
      method: HTTPMethod.DELETE,
    });
    apiInfoDidChangeNotification.post(
      new APIChange(APIChangeType.DELETE, itemType, id)
    );
    return result;
  }

  private async updateImageForItem(
    itemType: FetchItemType,
    id: number,
    image: File
  ): Promise<ProductItemNetworkResponse> {
    const url = urlForFetchItemType(itemType) + "/" + id + "/image";
    const bodyInfo: BodyInfo = {
      type: BodyInfoContentType.AUTO,
      data: image,
    };
    return this.performRequestRequiringAuth<ProductItemNetworkResponse>({
      url: url,
      method: HTTPMethod.PUT,
      bodyInfo,
    });
  }

  private async deleteImageForItem(
    itemType: FetchItemType,
    id: number
  ): Promise<ProductItemNetworkResponse> {
    const url = urlForFetchItemType(itemType) + "/" + id + "/image";
    return await this.performRequestRequiringAuth<ProductItemNetworkResponse>({
      url,
      method: HTTPMethod.DELETE,
    });
  }

  private performRequestRequiringAuth<ResultType>(
    props: FetchDataFromAPIProps
  ): Promise<ResultType> {
    const authenticationErrorText =
      "An authentication error has occured. Please log out and log back in to complete this action.";
    const authenticationError = new Error(authenticationErrorText);

    const authToken = this.authTokenProvider();

    if (authToken == null) {
      return Promise.reject(authenticationError);
    }

    const headers = props.headers ?? new Map<string, string>();
    headers.set("auth-token", authToken);
    props.headers = headers;
    return fetchDataFromAPI(props).catch((error) => {
      if (error instanceof APIRequestError && error.errorCode === 401) {
        return Promise.reject(
          new APIRequestError(authenticationErrorText, error.errorCode)
        );
      } else {
        return Promise.reject(error);
      }
    }) as Promise<ResultType>;
  }
}
