import { Root } from "react-dom/client";
import { Wallet } from "./types";
export declare class WallyConnector {
    authToken: string | undefined;
    root: Root | undefined;
    constructor(authToken: string);
    setAuthToken: (authToken: string) => void;
    requestGet(url: string): Promise<any>;
    getWallets(): Promise<Wallet[]>;
    authorise(): void;
}
