/**
 * TODO: Everything is in a single file for the moment so that typescript
 * builds a single script file that can access the global window scope.
 * Otherwise, it builds a module that needs importing.
 *
 * I'll figure out how to clean this up later if it's the direction we
 * decide to go.
 */
/**
 * ------ TYPES --------
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
/**
 * ------ CONSTANTS --------
 */
declare const APP_ROOT = "https://api.wally.xyz/";
declare const getScrimElement: () => HTMLElement;
declare const getRedirectPage: () => HTMLElement;
/**
 * ------ MAIN --------
 */
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
