export declare type SignedMessage = {
    address: string;
    signature: string;
};
export declare type WallyConnectorOptions = {
    clientId: string;
    isDevelopment?: boolean;
    devUrl?: string;
};
export declare type RedirectOptions = {
    closeWindow?: boolean;
    appendContent?: boolean;
};
export interface RequestObj {
    method: MethodName;
    params: any;
}
export declare enum MethodName {
    REQUEST_ACCOUNTS = "eth_requestAccounts",
    PERSONAL_SIGN = "personal_sign",
    SIGN = "eth_sign",
    GET_BALANCE = "eth_getBalance"
}
export declare enum WorkerMessage {
    LOGIN_SUCCESS = "login-success",
    LOGIN_FAILURE = "login-failure"
}
