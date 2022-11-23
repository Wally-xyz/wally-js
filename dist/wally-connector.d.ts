import { MethodNameType, MethodResponse, RequestObj, WallyConnectorOptions } from './types';
declare class WallyConnector {
    selectedAddress: string | null;
    private clientId;
    private disableRedirectClose;
    private host;
    private isDevelopment;
    private disableLoginOnRequest?;
    private onTokenFetched?;
    private redirectToCurrentLocation;
    private redirectUrl;
    private verbose;
    private didHandleRedirect;
    private emitterCallbacks;
    private isLoggingIn;
    private worker;
    private workerCallbacks;
<<<<<<< HEAD
    private verbose;
    private rejectLogin;
    constructor({ clientId, isDevelopment, devUrl, token, verbose, sharedWorkerUrl, }: WallyConnectorOptions);
=======
    constructor({ clientId, devUrl, disableRedirectClose, disableSharedWorker, isDevelopment, disableLoginOnRequest, onTokenFetched, redirectToCurrentLocation, redirectURL, verbose, }: WallyConnectorOptions);
    finishLogin: (address: string) => void;
    on(name: string, cb: (a?: any) => void): void;
    addListener(name: string, cb: (a?: any) => void): void;
    removeListener(name: string, fn: any): void;
    removeAllListeners(name: string): void;
    private emit;
>>>>>>> 2e97951 (Update SDK for chrome extension demo)
    private connectToSharedWorker;
    private handleWorkerMessage;
    private onWorkerMessage;
    private getRedirectUrl;
    login(): Promise<void>;
    isRedirected(): boolean;
    isLoggedIn(): boolean;
    isConnected(): boolean;
    handleRedirect(): Promise<void>;
    private setAuthToken;
    private getAuthToken;
    private generateStateCode;
    private saveState;
    private getState;
    private deleteState;
    private isWallyMethod;
    private isRPCMethod;
    /**
     * @deprecated - see this.request()
     */
    sendAsync(req: any): Promise<any>;
    /**
     * This is the major exposed method for supporting JSON RPC methods
     * and associated wallet/blockchain functionality.
     * There are two main types of requests: those that require wallet info
     * (address, signing), and those that do not (gas prices, last block).
     * We route the former to customized endpoints on the backend that handle
     * this extra wallet fetching and logic, and the latter to an endpoint
     * that essentially works as a passthrough to ethers/alchemy.
     *
     * TODO: Move requesting logic and helpers to separate file/module
     * @param req
     * @param req.method - the name of the RPC method
     * @param req.params - the required parameters for the method
     * @returns Promise<MethodResponse> | null
     * @see https://ethereum.org/en/developers/docs/apis/json-rpc/#json-rpc-methods
     */
    request<T extends MethodNameType>(req: RequestObj<T>): Promise<MethodResponse<T> | null>;
    /**
     * The promise for handling when trying to make a request before the user has
     * logged in. Either:
     * - trigger a login once (web3 standard), and trigger the request after the
     *   login is complete (adding requests in the meantime to the emitter queue) OR
     * - just add all requests to the emitter queue, waiting for the consumer to manually login.
     * @param req RequestObj
     * @returns Promise
     */
    private deferredRequest;
    private formatWallyParams;
    private isJSONContentType;
    private formatWallyResponse;
    /**
     * Method used doing wallet-related actions like requesting accounts
     * and signing things - actions that require wallet/private key access
     * and are basically the core wally value prop.
     * @param method The RPC method name associated with the wally api call
     * @param params The json rpc spec params (*not* wally's spec)
     * @returns WallyResponse - adheres to the json rpc spec
     */
    private requestWally;
    /**
     * Handle other non-wally-specific methods - forwards to ethers/alchemy
     * on the backend
     * @param method The RPC method name
     * @param params The json rpc spec params
     * @returns RPCResponse - adheres to the json rpc spec
     */
    private requestRPC;
}
export default WallyConnector;
