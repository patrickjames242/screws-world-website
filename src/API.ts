

export interface LoginRequestResult{
    readonly authToken: string,
}

const correctPasscode = "screwsworld";

export function logIn(passcode: string): Promise<LoginRequestResult>{
    return new Promise((resolve, fail) => {
        setTimeout(() => {
            if (passcode === correctPasscode){
                resolve({authToken: "some random string"});
            } else {
                fail("The password you entered was incorrect.");
            }
        }, 1500);
    });
}