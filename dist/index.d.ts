/**
 * Everything is in a single file for the mo
 */
declare type SignedMessage = {
    address: string;
    signature: string;
};
declare type WallyConnectorOptions = {
    clientId: string;
    isDevelopment?: boolean;
    devUrl?: string;
};
declare type RedirectOptions = {
    closeWindow?: boolean;
    appendContent?: boolean;
};
interface RequestObj {
    method: MethodName;
    params: any;
}
declare enum MethodName {
    'eth_requestAccounts' = "eth_requestAccounts",
    'personal_sign' = "personal_sign",
    'eth_getBalance' = "eth_getBalance"
}
declare const APP_ROOT = "https://api.wally.xyz/";
declare const getScrimElement: () => HTMLElement;
declare const getRedirectPage: () => HTMLElement;
declare class WallyConnector {
    private clientId;
    private host;
    private isDevelopment;
    selectedAddress: string | null;
    private didHandleRedirect;
    constructor();
    init({ clientId, isDevelopment, devUrl, }: WallyConnectorOptions): void;
    loginWithEmail(): Promise<void>;
    isRedirected(): boolean;
    isLoggedIn(): boolean;
    handleRedirect({ closeWindow, appendContent, }: RedirectOptions): Promise<void>;
    private setAuthToken;
    private getAuthToken;
    private generateStateCode;
    private saveState;
    private getState;
    private deleteState;
    request(req: RequestObj): Promise<any>;
    requestAccounts(): Promise<string[]>;
    signMessage(params: string[]): Promise<SignedMessage | string>;
    /**
     * Handle other non-wally-specific methods - forwards to ethers/alchemy
     * on the backend
     * @param method The RPC Method
     * @param params Arbitrary array of params
     * @returns whatever you want it to
     */
    private _request;
}
declare var wally: WallyConnector;
