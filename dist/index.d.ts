import { WallyConnectorOptions, RedirectOptions } from './types';
import WallyConnector from './wally-connector';
declare global {
    var wally: WallyConnector;
}
export declare const init: (options: WallyConnectorOptions) => void;
export declare const handleRedirect: (options: RedirectOptions) => void;
export declare const getProvider: () => WallyConnector | null;
