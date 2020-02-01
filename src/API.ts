


import { Optional, Notification } from "jshelpers";


enum HTTPMethod {
    GET,
    POST,
    PUT,
    DELETE,
}


interface FetchDataFromAPIProps {
    url: string,
    method?: HTTPMethod,
    body?: object,
    headers?: { [key: string]: string },
}

async function fetchDataFromAPI<ResultType>(props: FetchDataFromAPIProps): Promise<ResultType> {

    const methodText = (() => {
        switch (props.method ?? HTTPMethod.GET) {
            case HTTPMethod.GET: return "GET";
            case HTTPMethod.POST: return "POST";
            case HTTPMethod.PUT: return "PUT";
            case HTTPMethod.DELETE: return "DELETE";
        }
    })();

    const headers = (() => {
        let x: { [x: string]: string } = {}
        if (props.body) {
            x['Content-Type'] = "application/json";
        }
        return { ...x, ...props.headers }
    })();

    const result = await fetch(props.url, {
        method: methodText,
        headers: headers,
        body: props.body ? JSON.stringify(props.body) : undefined,
    });
    const result_1 = await result.json();
    if (result_1.status === "success") {
        return result_1.data;
    }
    else if (result_1.status === "failure") {
        return Promise.reject(new Error(result_1.errorMessage));
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


// const baseURL = "https://screws-world-backend.herokuapp.com"
const baseURL = "http://localhost:5000";

const categoriesURL = baseURL + "/categories";
const productsURL = baseURL + "/products";

export interface LoginRequestResult {
    readonly authToken: string,
}

export function logIn(username: string, password: string): Promise<LoginRequestResult> {
    const body = { username, password };
    return fetchDataFromAPI({ url: baseURL + "/login", method: HTTPMethod.POST, body });
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
    parentCategoryID?: number,
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
        const body = { title: props.title, description: props.description, parent_category: props.parentCategoryID };
        const result = await this.performRequestRequiringAuth<ProductItemNetworkResponse>({ url: urlForFetchItemType(itemType), method: HTTPMethod.POST, body });
        apiInfoDidChangeNotification.post(new APIChange(APIChangeType.INSERTION, itemType, result));
        return result;
    }

    async editItem(itemType: FetchItemType, id: number, props: ProductItemProps): Promise<ProductItemNetworkResponse> {
        const body = { title: props.title, description: props.description, parent_category: props.parentCategoryID };
        const url = urlForFetchItemType(itemType) + "/" + id;
        const result = await this.performRequestRequiringAuth<ProductItemNetworkResponse>({ url, body: body, method: HTTPMethod.PUT });
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
        if (!authToken) {
            return Promise.reject(new Error("An authentication error has occured. Please log out and log back in to complete this action."));
        }
        props.headers = {
            "auth-token": authToken,
            ...props.headers,
        }
        return fetchDataFromAPI(props);
    }

}


