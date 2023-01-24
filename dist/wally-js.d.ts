import { MethodNameType, MethodResponse, RequestObj, WallyOptions } from './types';
declare class WallyJS {
    private auth;
    private messenger;
    private requester;
    constructor({ authToken, clientId, disableRedirectClose, redirectURL, sharedWorkerUrl, verbose, _devUrl, _disableSharedWorker, _isDevelopment, _onTokenFetched, email, }: WallyOptions);
    get selectedAddress(): string;
    finishLogin(address: string): void;
    on(name: string, cb: (a?: any) => void): void;
    removeListener(name: string, fn: any): void;
    removeAllListeners(name: string): void;
    login(email?: string): Promise<void>;
    logout(): void;
    isRedirected(): boolean;
    isLoggedIn(): boolean;
    handleRedirect(): Promise<void>;
    request<T extends MethodNameType>(req: RequestObj<T>): Promise<MethodResponse<T> | null>;
    /**
     * @deprecated use isLoggedIn()
     */
    isConnected(): boolean;
    /**
     * @deprecated use on()
     */
    addListener(name: string, cb: (a?: any) => void): void;
    /**
     * @deprecated - use request()
     */
    sendAsync(req: any): Promise<any>;
    /**
     * @deprecated - use request({ method: 'eth_requestAccounts' }) directly
     */
    enable(): Promise<MethodResponse<"eth_requestAccounts">>;
}
export default WallyJS;
