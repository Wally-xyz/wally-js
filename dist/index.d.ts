import { WallyConnectorOptions } from './types';
import WallyConnector from './wally-connector';
export declare const init: (options: WallyConnectorOptions) => void;
export declare const getProvider: (supress?: boolean) => WallyConnector | undefined;
/**
 * Must be used if `disableLoginOnRequest` is true.
 * Can optionally pass in an email to sign up. [wip]
 * @param email
 * @returns
 */
export declare const login: (email?: string) => Promise<void>;
export declare const finishLogin: (address: string) => void;
export declare const logout: () => void;
export declare const clearInstance: () => void;
export default WallyConnector;
