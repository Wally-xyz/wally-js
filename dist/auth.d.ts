import { AuthOptions } from './types';
export default class Auth {
    private clientId;
    private disableRedirectClose;
    private isDevelopment;
    private onTokenFetched?;
    private redirectUrl?;
    private host;
    private messenger;
    isLoggingIn: boolean;
    selectedAddress: string;
    private didHandleRedirect;
    constructor({ authToken, clientId, disableRedirectClose, host, messenger, redirectURL, _isDevelopment, _onTokenFetched, }: AuthOptions);
    login(email?: string): Promise<void>;
    isRedirected(): boolean;
    handleRedirect(): Promise<void>;
    private setAuthToken;
    getToken(): string | null;
    clearAuthToken(): void;
    private generateStateCode;
    private saveState;
    private getState;
    private deleteState;
}
