import { Wallet } from "./types";
export declare class WallyConnector {
    authToken: string | undefined;
    constructor(authToken: string);
    requestGet(url: string): Promise<any>;
    getWallets(): Promise<Wallet[]>;
}
