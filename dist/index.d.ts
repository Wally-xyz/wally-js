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
    loginWithEmail(): void;
    isRedirected(): boolean;
    isLoggedIn(): boolean;
    handleRedirect(): Promise<void>;
    private setAuthToken;
    private getAuthToken;
    private generateStateCode;
    private saveState;
    private getState;
    private deleteState;
    request(req: RequestObj): Promise<any>;
    requestAccounts(): Promise<string[]>;
    signMessage(params: string[]): Promise<SignedMessage | string>;
}
export {};
