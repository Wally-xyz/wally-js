import { SignedMessage, WallyConnectorOptions } from './types';
export declare class WallyConnector {
    private readonly clientId;
    private readonly opts?;
    private host;
    constructor(clientId: string, opts?: WallyConnectorOptions | undefined);
    loginWithEmail(): void;
    isRedirected(): boolean;
    handleRedirect(): Promise<void>;
    private setAuthToken;
    private getAuthToken;
    private generateStateCode;
    private saveState;
    private getState;
    private deleteState;
    signMessage(message: string): Promise<SignedMessage>;
}
