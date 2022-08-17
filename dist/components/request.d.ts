import { VeriftOTPResult, Wallet } from "../types";
export declare const request: (authToken: string | undefined, method: string, url: string, data?: Record<string, unknown>) => Promise<Wallet[] | VeriftOTPResult>;
