import { WallyConnectorOptions } from './types';
import WallyConnector from './wally-connector';
export declare const init: (options: WallyConnectorOptions) => void;
export declare const getProvider: (supress?: boolean) => WallyConnector | null;
export declare const login: () => Promise<void>;
export declare const finishLogin: (address: string) => void;
