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
    'eth_requestAccounts' = "eth_requestAccounts",
    'personal_sign' = "personal_sign",
    'eth_sign' = "eth_sign",
    'eth_getBalance' = "eth_getBalance"
}
