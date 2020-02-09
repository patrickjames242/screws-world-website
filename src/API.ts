


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
    data: any,
    type: BodyInfoContentType,
}

interface FetchDataFromAPIProps {
    url: string,
    method?: HTTPMethod,
    bodyInfo?: BodyInfo,
    headers?: Map<string, string>,
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
        if (props.bodyInfo == null) { return undefined; }
        switch (props.bodyInfo.type) {
            case BodyInfoContentType.JSON: return JSON.stringify(props.bodyInfo.data);
            case BodyInfoContentType.AUTO: return props.bodyInfo.data;
        }
    })();


    const fetchResult = await fetch(props.url, {
        method, headers, body,
    });

    const resultJsonBody = await fetchResult.json() as any;

    if (resultJsonBody.status === "success") {
        return resultJsonBody.data;
    } else if (resultJsonBody.status === "failure" && resultJsonBody.errorMessage != null) {
        return Promise.reject(new Error(resultJsonBody.errorMessage));
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
    image_url: Optional<string>,
}

export function fetchAllItems(itemType: FetchItemType): Promise<ProductItemNetworkResponse[]> {
    return fetchDataFromAPI({ url: urlForFetchItemType(itemType) });
}

export interface ProductItemProps {
    title?: string,
    description?: Optional<string>,
    parentCategoryID?: Optional<number>,
    image?: Optional<File>,
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
        const bodyInfo = this.getItemUpdateBodyInfoForProductItemProps(props);
        let result = await this.performRequestRequiringAuth<ProductItemNetworkResponse>({ url: urlForFetchItemType(itemType), method: HTTPMethod.POST, bodyInfo });
        if (props.image !== undefined){
            if (props.image)
            result = await this.updateImageForItem(itemType, result.id, props.image);
        }
        apiInfoDidChangeNotification.post(new APIChange(APIChangeType.INSERTION, itemType, result));
        return result;
    }

    
    /**
     * Only add properties to the props object that you want to be updated. If the value of a property is null, it will be sent to the server, if the value is undefined, the property will be ignored.
     */
    
    async editItem(itemType: FetchItemType, id: number, props: ProductItemProps): Promise<ProductItemNetworkResponse> {
        const url = urlForFetchItemType(itemType) + "/" + id;
        const bodyInfo = this.getItemUpdateBodyInfoForProductItemProps(props); // when the props object is converted to a json string, the undefined properties will be removed automatically
        let networkResult = await this.performRequestRequiringAuth<ProductItemNetworkResponse>({ url, bodyInfo, method: HTTPMethod.PUT });
        if (props.image !== undefined){
            if (props.image === null){
                networkResult = await this.deleteImageForItem(itemType, networkResult.id);
            } else if (props.image instanceof File) {
                networkResult = await this.updateImageForItem(itemType, networkResult.id, props.image);
            }
        }
        apiInfoDidChangeNotification.post(new APIChange(APIChangeType.UPDATE, itemType, networkResult));
        return networkResult;
    }

    private getItemUpdateBodyInfoForProductItemProps(props: ProductItemProps): BodyInfo{
        return {
            type: BodyInfoContentType.JSON,
            data: {
                title: props.title, 
                description: props.description, 
                parent_category: props.parentCategoryID,
            }   
        }
    }

    async deleteItem(itemType: FetchItemType, id: number): Promise<null> {
        const result = await this.performRequestRequiringAuth<null>({ url: urlForFetchItemType(itemType) + "/" + id, method: HTTPMethod.DELETE });
        apiInfoDidChangeNotification.post(new APIChange(APIChangeType.DELETE, itemType, id));
        return result;
    }

    private async updateImageForItem(itemType: FetchItemType, id: number, image: File): Promise<ProductItemNetworkResponse>{
        const url = urlForFetchItemType(itemType) + "/" + id + "/image";
        const bodyInfo: BodyInfo = {
            type: BodyInfoContentType.AUTO,
            data: image,
        }
        return await this.performRequestRequiringAuth<ProductItemNetworkResponse>({url: url, method: HTTPMethod.PUT, bodyInfo});
    }

    private async deleteImageForItem(itemType: FetchItemType, id: number): Promise<ProductItemNetworkResponse>{
        const url = urlForFetchItemType(itemType) + "/" + id + "/image";
        return await this.performRequestRequiringAuth<ProductItemNetworkResponse>({url, method: HTTPMethod.DELETE})
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


