import { SignedMessage, WallyConnectorOptions } from './types';
declare enum MethodName {
    'eth_requestAccounts' = "eth_requestAccounts",
    'personal_sign' = "personal_sign",
    'eth_getBalance' = "eth_getBalance"
}
interface RequestObj {
    method: MethodName;
    params: any;
}
export declare class WallyConnector {
    private readonly clientId;
    private readonly options?;
    private host;
    selectedAddress: string | null;
    constructor(clientId: string, options?: WallyConnectorOptions | undefined);
    loginWithEmail(): Promise<void>;
    isRedirected(): boolean;
    isLoggedIn(): boolean;
    handleRedirect(): Promise<void>;
    /**
     * Sensitive things:
     * - clientId
     * - host
     * - isDevelopment
     * @returns
     */
    static handleRedirect(clientId?: string): Promise<void>;
    private setAuthToken;
    private getAuthToken;
    private static setAuthToken;
    private generateStateCode;
    private saveState;
    private getState;
    private deleteState;
    private static getState;
    private static deleteState;
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
export {};
