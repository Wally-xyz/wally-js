export declare type Wallet = {
    id: string;
    email: string;
    address: string;
    tags: string[];
    referenceId: string;
};
export declare type VeriftOTPResult = {
    token?: string;
};
export declare type RequestObject = {
    method: string;
    headers: {
        Authorization?: string;
        Accept: string;
        "Content-Type": string;
    };
    body?: string;
};
