import { VeriftOTPResult, Wallet } from "./types";
export declare class WallyConnector {
    appId: string | undefined;
    authToken: string | undefined;
    constructor({ appId, authToken, }?: {
        appId?: string;
        authToken?: string;
    });
    setAuthToken: (authToken: string) => void;
    requestGet(url: string, isAuthenticated?: boolean): Promise<any>;
    requestPost(url: string, data?: Record<string, unknown>, isAuthenticated?: boolean): Promise<any>;
    getOTP(email: string): Promise<Wallet[]>;
    verifyOTP(email: string, OTP: string): Promise<VeriftOTPResult>;
    signMessage(message: string): Promise<Wallet[]>;
    getWallets(): Promise<Wallet[]>;
}
