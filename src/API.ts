


import { Optional, Notification } from "jshelpers";


enum HTTPMethod {
    GET,
    POST,
    PUT,
    DELETE,
}

enum BodyInfoContentType {
    JSON,
    FORM_DATA,
}

interface BodyInfo {
    data: object,
    type: BodyInfoContentType,
}

interface FetchDataFromAPIProps {
    url: string,
    method?: HTTPMethod,
    bodyInfo?: BodyInfo,
    headers?: Map<string, string>,
}

function getFormDataForObject(object: object): FormData {
    const formData = new FormData();
    for (const key in object) {
        formData.append(key, (object as any)[key]);
    }
    return formData;
}

async function fetchDataFromAPI<ResultType>(props: FetchDataFromAPIProps): Promise<ResultType> {

    const method = (() => {
        switch (props.method ?? HTTPMethod.GET) {
            case HTTPMethod.GET: return "GET";
            case HTTPMethod.POST: return "POST";
            case HTTPMethod.PUT: return "PUT";
            case HTTPMethod.DELETE: return "DELETE";
            default: throw new Error("the http method value provided is not valid");
        }
    })();

    const headers = (() => {
        const x: { [key: string]: string } = {}

        if (props.bodyInfo) {
            switch (props.bodyInfo.type) {
                case BodyInfoContentType.JSON:
                    x["Content-Type"] = "application/json";
                    break;
                case BodyInfoContentType.FORM_DATA:
                    // the browser will set the content type for us when form data is submitted as the body
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
        if (props.bodyInfo == null) { return undefined; }
        switch (props.bodyInfo.type) {
            case BodyInfoContentType.JSON: return JSON.stringify(props.bodyInfo.data);
            case BodyInfoContentType.FORM_DATA: return getFormDataForObject(props.bodyInfo.data);
        }
    })();

    const fetchResult = await fetch(props.url, {
        method, headers, body,
    });

    const resultJsonBody = await fetchResult.json() as any;

    if (resultJsonBody.status === "success") {
        return resultJsonBody.data;
    }
    else if (resultJsonBody.status === "failure" && resultJsonBody.errorMessage != null) {
        return Promise.reject(new Error(resultJsonBody.errorMessage));
    }
    else {
        return Promise.reject(new Error("An unknown error occured."));
    }
}

export enum FetchItemType {
    CATEGORY,
    PRODUCT,
}

function urlForFetchItemType(fetchItemType: FetchItemType): string {
    switch (fetchItemType) {
        case FetchItemType.CATEGORY: return categoriesURL;
        case FetchItemType.PRODUCT: return productsURL;
    }
}
















// const baseURL = "https://screws-world-backend.herokuapp.com";
const baseURL = "http://localhost:5000";

const categoriesURL = baseURL + "/categories";
const productsURL = baseURL + "/products";

export interface LoginRequestResult {
    readonly authToken: string,
}

export function logIn(username: string, password: string): Promise<LoginRequestResult> {
    const bodyInfo: BodyInfo = {
        type: BodyInfoContentType.JSON,
        data: { username, password },
    }
    return fetchDataFromAPI({ url: baseURL + "/login", method: HTTPMethod.POST, bodyInfo });
}



export interface ProductItemNetworkResponse {
    id: number,
    title: string,
    description: Optional<string>,
    parent_category: Optional<number>,
}

export function fetchAllItems(itemType: FetchItemType): Promise<ProductItemNetworkResponse[]> {
    return fetchDataFromAPI({ url: urlForFetchItemType(itemType) });
}

export interface ProductItemProps {
    title: string,
    description?: string,
    parentCategoryID?: Optional<number>,
    image?: Optional<File>,
}

function getBodyInfoForProductItemProps(props: ProductItemProps): BodyInfo{
    const bodyInfo: BodyInfo = {
        type: BodyInfoContentType.FORM_DATA,
        data: { 
            json_data: new File([JSON.stringify({
                title: props.title, 
                description: props.description, 
                parent_category: props.parentCategoryID, 
            })], "json_data.json", {type: "application/json"}),
        },
    }

    if (props.image != null){
        (bodyInfo.data as any).image_data = props.image;
    }
    return bodyInfo;
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
        readonly info: ProductItemNetworkResponse | number,
    ) { }

}



export const apiInfoDidChangeNotification = new Notification<APIChange>();


export class RequestsRequiringAuthentication {

    constructor(
        private readonly authTokenProvider: () => Optional<string>,
    ) { }

    async createNewItem(itemType: FetchItemType, props: ProductItemProps): Promise<ProductItemNetworkResponse> {
        const bodyInfo = getBodyInfoForProductItemProps(props);
        const result = await this.performRequestRequiringAuth<ProductItemNetworkResponse>({ url: urlForFetchItemType(itemType), method: HTTPMethod.POST, bodyInfo });
        apiInfoDidChangeNotification.post(new APIChange(APIChangeType.INSERTION, itemType, result));
        return result;
    }

    async editItem(itemType: FetchItemType, id: number, props: ProductItemProps): Promise<ProductItemNetworkResponse> {
        const url = urlForFetchItemType(itemType) + "/" + id;

        const bodyInfo = getBodyInfoForProductItemProps(props);

        const result = await this.performRequestRequiringAuth<ProductItemNetworkResponse>({ url, bodyInfo, method: HTTPMethod.PUT });
        apiInfoDidChangeNotification.post(new APIChange(APIChangeType.UPDATE, itemType, result));
        return result;
    }

    async deleteItem(itemType: FetchItemType, id: number): Promise<null> {
        const result = await this.performRequestRequiringAuth<null>({ url: urlForFetchItemType(itemType) + "/" + id, method: HTTPMethod.DELETE });
        apiInfoDidChangeNotification.post(new APIChange(APIChangeType.DELETE, itemType, id));
        return result;
    }

    private performRequestRequiringAuth<ResultType>(props: FetchDataFromAPIProps): Promise<ResultType> {
        const authToken = this.authTokenProvider();
        if (authToken == null) {
            return Promise.reject(new Error("An authentication error has occured. Please log out and log back in to complete this action."));
        }
        const headers = props.headers ?? new Map<string, string>();
        headers.set("auth-token", authToken);
        props.headers = headers;
        return fetchDataFromAPI(props);
    }

}


