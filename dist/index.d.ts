import { Root } from "react-dom/client";
import { VeriftOTPResult, Wallet } from "./types";
export declare class WallyConnector {
    appId: string | undefined;
    authToken: string | undefined;
    root: Root | undefined;
    constructor({ appId, authToken }: {
        appId: string;
        authToken: string;
    });
    setAuthToken: (authToken: string) => void;
    requestGet(url: string): Promise<any>;
    requestPost(url: string, data?: Record<string, unknown>): Promise<any>;
    getOTP(email: string): Promise<Wallet[]>;
    verifyOTP(email: string, otp: string): Promise<VeriftOTPResult>;
    getWallets(): Promise<Wallet[]>;
    authorise(): void;
}
