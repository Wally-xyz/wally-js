import { SignedMessage, WallyConnectorOptions } from './types';
export declare class WallyConnector {
    private readonly clientId;
    private readonly opts?;
    constructor(clientId: string, opts?: WallyConnectorOptions | undefined);
    loginWithEmail(): void;
    private setAuthToken;
    private getAuthToken;
    private generateStateCode;
    signMessage(message: string): Promise<SignedMessage>;
}
