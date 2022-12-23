import { WallyOptions } from './types';
import WallyJS from './wally-js';
export declare const init: (options: WallyOptions) => void;
export declare const getProvider: (supress?: boolean) => WallyJS | undefined;
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
