

enum HTTPMethod {
    GET,
    POST,
    PUT,
    DELETE,
}


function fetchDataFromAPI<ResultType>(url: string, method: HTTPMethod = HTTPMethod.GET, body?: object): Promise<ResultType> {

    const methodText = (() => {
        switch (method) {
            case HTTPMethod.GET: return "GET";
            case HTTPMethod.POST: return "POST";
            case HTTPMethod.PUT: return "PUT";
            case HTTPMethod.DELETE: return "DELETE";
        }
    })();

    return fetch(url, {
        method: methodText,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    })
    .then(result => result.json())
    .then(result => {
        if (result.status === "success") {
            return result.data;
        } else if (result.status === "failure") {
            return Promise.reject(new Error(result.errorMessage));
        } else {
            return Promise.reject(new Error("An unknown error occured."))
        }
    })
}






const baseURL = "https://screws-world-backend.herokuapp.com"
// const baseURL = "http://localhost:5000";

const categoriesURL = baseURL + "/categories";
const productsURL = baseURL + "/products";

export interface LoginRequestResult {
    readonly authToken: string,
}

export function logIn(username: string, password: string): Promise<LoginRequestResult> {
    const body = { username, password };
    return fetchDataFromAPI(baseURL + "/login", HTTPMethod.POST, body);
}



export function fetchAllCategories(): Promise<object> {
    return fetchDataFromAPI(categoriesURL);
}

export function fetchCategoryForID(id: number): Promise<object>{
    return fetchDataFromAPI(categoriesURL + "/" + id);
}



export function fetchAllProducts(): Promise<object>{
    return fetchDataFromAPI(productsURL);
}

export function fetchProductForID(id: number): Promise<object>{
    return fetchDataFromAPI(productsURL + "/" + id);
}










