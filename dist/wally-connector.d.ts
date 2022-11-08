import { MethodNameType, MethodResponse, RedirectOptions, RequestObj, WallyConnectorOptions } from './types';
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
    private formatWallyParams;
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
