import { WallyConnectorOptions, RedirectOptions, RequestObj, SignedMessage } from './types';
declare class WallyConnector {
    private clientId;
    private host;
    private isDevelopment;
    selectedAddress: string | null;
    private didHandleRedirect;
    private worker;
    private workerCallbacks;
    constructor({ clientId, isDevelopment, devUrl }: WallyConnectorOptions);
    private connectToSharedWorker;
    private handleWorkerMessage;
    private onWorkerMessage;
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
export default WallyConnector;
