import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer';
import { Block, Filter, TransactionReceipt, TransactionRequest, TransactionResponse } from '@ethersproject/providers';
import { BigNumberish } from '@ethersproject/bignumber';
import Messenger from './messenger';
import Auth from './auth';
export type SignedMessage = {
    address: string;
    signature: string;
};
export interface MessengerOptions {
    /**
     * Where the package should look for the shared worker script. Must be set if the shared worker
     * is enabled, and the location will change likely depending on your framework.
     */
    sharedWorkerUrl?: string;
    /**
     * If you have another cross-tab messaging solution for informing the primary browser
     * tab when the secondary completes its redirection and token fetching. Should only
     * be used internally for the chrome extension or if you know users will be using
     * a browser that does not have support.
     * @default false
     */
    _disableSharedWorker?: boolean;
}
interface _AuthOptions {
    /**
     * If you would like to use your own authentication flow,
     * you can supply the retreived auth token here.
     */
    authToken?: string;
    /**
     * The clientId you get when signing up. Should match the dashboard value
     */
    clientId: string;
    /**
     * Disable automatically closing the redirect window. Shouldn't really be used
     * outside of the
     * @default false
     */
    disableRedirectClose?: boolean;
    /**
     * If you'd like to use a more dynamic redirect. Only possible when the
     * redirectURL in your dashboard settings is set as a regex.
     * TODO: !!!!CASING!!!! Rename redirectUrl to match
     */
    redirectURL?: string;
    /**
     * Required when using devUrl.
     * TODO: Make this better.
     * @default false
     */
    _isDevelopment?: boolean;
    /**
     * Function called after the token is fetched in the redirect. Should be used
     * when the _disableSharedWorker is true - as you'll need some other method of
     * notifying the main window to complete the login process. Should
     * be used in conjunction with the `finishLogin()` method.
     * Only used for the chrome extension
     * @param address The connected wallet's address
     */
    _onTokenFetched?(address: string): void;
}
export interface AuthOptions extends _AuthOptions {
    host: string;
    messenger: Messenger;
}
interface _RequesterOptions {
    /** Same */
    clientId: string;
    /**
     * If you want more insight into what's going on (requests and responses)
     * @default false
     */
    verbose?: boolean;
}
export interface RequesterOptions extends _RequesterOptions {
    host: string;
    messenger: Messenger;
    auth: Auth;
    email?: string;
}
export interface WallyOptions extends MessengerOptions, _AuthOptions, _RequesterOptions {
    /**
     * The local instance of the wally api. APP ROOT used if unset or not dev mode
     */
    _devUrl?: string;
    /**
     * Email address to pass in for login
     */
    email?: string;
}
export declare enum WorkerMessage {
    LOGIN_SUCCESS = "login-success",
    LOGIN_FAILURE = "login-failure"
}
export declare enum EmitterMessage {
    ACCOUNTS_CHANGED = "accountsChanged",
    CONNECTED = "connected"
}
export type RequestObj<T extends MethodNameType> = T extends WallyMethodNameType ? WallyRequestObj<T> : T extends RPCMethodNameType ? RPCRequestObj<T> : undefined;
export type WallyRequestObj<T extends WallyMethodName | WallyMethodNameType> = {
    method: T;
} & (T extends WallyMethodNoParams ? unknown : {
    params: WallyMethodParams<T>;
});
export type RPCRequestObj<T extends RPCMethodName | RPCMethodNameType> = {
    method: T;
} & (T extends RPCMethodNoParams ? unknown : {
    params: RPCMethodParams<T>;
});
export type HexString = string;
export type Address = HexString;
export type BlockNumber = HexString | number;
export type Index = string;
export type FilterId = string;
export type BlockHash = HexString;
export type TransactionHash = HexString;
export type Signature = HexString;
export type BlockTag = BlockNumber | 'earliest' | 'latest' | 'pending';
export type WTransactionRequest = TransactionRequest & {
    gas?: HexString;
};
export interface UnsignedTypedData {
    types: Record<string, Array<TypedDataField>>;
    primaryType: string;
    domain: TypedDataDomain;
    message: Record<string, any>;
}
export declare enum WallyMethodName {
    ACCOUNTS = "eth_accounts",
    REQUEST_ACCOUNTS = "eth_requestAccounts",
    PERSONAL_SIGN = "personal_sign",
    SIGN = "eth_sign",
    SIGN_TYPED = "eth_signTypedData",
    SIGN_TYPED_V4 = "eth_signTypedData_v4",
    SIGN_TRANSACTION = "eth_signTransaction",
    SEND_TRANSACTION = "eth_sendTransaction"
}
export type WallyMethodNameType = `${WallyMethodName}`;
export declare enum RPCMethodName {
    WEB3_CLIENT_VERSION = "web3_clientVersion",
    WEB3_SHA = "web3_sha3",
    NET_VERSION = "net_version",
    NET_LISTENING = "net_listening",
    PROFOCOL_VERSION = "eth_protocolVersion",
    SYNCING = "eth_syncing",
    GAS_PRICE = "eth_gasPrice",
    BLOCK_NUMBER = "eth_blockNumber",
    GET_BALANCE = "eth_getBalance",
    GET_STORAGE_AT = "eth_getStorageAt",
    GET_TRANSACTION_COUNT = "eth_getTransactionCount",
    GET_BLOCK_TRANSACTION_COUNT_BY_HASH = "eth_getBlockTransactionCountByHash",
    GET_BLOCK_TRANSACTION_COUNT_BY_NUMBER = "eth_getBlockTransactionCountByNumber",
    GET_UNCLE_COUNT_BY_BLOCK_HASH = "eth_getUncleCountByBlockHash",
    GET_UNCLE_COUNT_BY_BLOCK_NUMBER = "eth_getUncleCountByBlockNumber",
    GET_CODE = "eth_getCode",
    SEND_RAW_TRANSACTION = "eth_sendRawTransaction",
    CALL = "eth_call",
    ESTIMATE_GAS = "eth_estimateGas",
    GET_BLOCK_BY_HASH = "eth_getBlockByHash",
    GET_BLOCK_BY_NUMBER = "eth_getBlockByNumber",
    GET_TRANSACTION_BY_HASH = "eth_getTransactionByHash",
    GET_TRANSACTION_BY_BLOCK_HASH_AND_INDEX = "eth_getTransactionByBlockHashAndIndex",
    GET_TRANSACTION_BY_BLOCK_NUMBER_AND_INDEX = "eth_getTransactionByBlockNumberAndIndex",
    GET_TRANSACTION_RECEIPT = "eth_getTransactionReceipt",
    GET_UNCLE_BY_BLOCK_HASH_AND_INDEX = "eth_getUncleByBlockHashAndIndex",
    GET_UNCLE_BY_BLOCK_NUMBER_AND_INDEX = "eth_getUncleByBlockNumberAndIndex",
    NEW_FILTER = "eth_newFilter",
    NEW_BLOCK_FILTER = "eth_newBlockFilter",
    NEW_PENDING_TRANSACTION_FILTER = "eth_newPendingTransactionFilter",
    UNINSTALL_FILTER = "eth_uninstallFilter",
    GET_FILTER_CHANGES = "eth_getFilterChanges",
    GET_FILTER_LOGS = "eth_getFilterLogs",
    GET_LOGS = "eth_getLogs",
    CHAIN_ID = "eth_chainId"
}
export type RPCMethodNameType = `${RPCMethodName}`;
export declare enum UnsupportedMethodName {
    NET_PEERCOUNT = "net_peerCount",
    COINBASE = "eth_coinbase",
    MINING = "eth_mining",
    HASHRATE = "eth_hashrate",
    GET_COMPILERS = "eth_getCompilers",
    COMPILE_SOLIDITY = "eth_compileSolidity",
    COMPILE_LLL = "eth_compileLLL",
    COMPILE_SERPEND = "eth_compileSerpent",
    GET_WORK = "eth_getWork",
    SUBMIT_WORK = "eth_submitWork",
    SUBMIT_HASHRATE = "eth_sumbitHashrate"
}
export type MethodName = WallyMethodName | RPCMethodName;
export type MethodNameType = WallyMethodNameType | RPCMethodNameType;
export type SignParams = [Address, any];
export type PersonalSignParams = [any, Address];
export type SignTypedParams = [string, UnsignedTypedData | string];
type WallyMethodNoParams = `${WallyMethodName.ACCOUNTS}` | `${WallyMethodName.REQUEST_ACCOUNTS}`;
export type WallyMethodParams<T> = T extends `${WallyMethodName.PERSONAL_SIGN}` ? PersonalSignParams : T extends `${WallyMethodName.SIGN}` ? SignParams : T extends WallyMethodNoParams ? undefined : T extends `${WallyMethodName.SEND_TRANSACTION}` | `${WallyMethodName.SIGN_TRANSACTION}` ? [TransactionRequest] : T extends `${WallyMethodName.SIGN_TYPED}` | `${WallyMethodName.SIGN_TYPED_V4}` ? SignTypedParams : undefined;
type RPCMethodNoParams = `${RPCMethodName.WEB3_CLIENT_VERSION}` | `${RPCMethodName.NET_VERSION}` | `${RPCMethodName.NET_LISTENING}` | `${RPCMethodName.PROFOCOL_VERSION}` | `${RPCMethodName.SYNCING}` | `${RPCMethodName.GAS_PRICE}` | `${RPCMethodName.BLOCK_NUMBER}` | `${RPCMethodName.NEW_BLOCK_FILTER}` | `${RPCMethodName.NEW_PENDING_TRANSACTION_FILTER}` | `${RPCMethodName.CHAIN_ID}`;
export type RPCMethodParams<T> = T extends RPCMethodNoParams ? undefined : T extends `${RPCMethodName.GET_BALANCE}` | `${RPCMethodName.GET_TRANSACTION_COUNT}` ? [Address, BlockTag] : T extends `${RPCMethodName.GET_STORAGE_AT}` ? [Address, BigNumberish, BlockTag] : T extends `${RPCMethodName.GET_BLOCK_TRANSACTION_COUNT_BY_HASH}` | `${RPCMethodName.GET_UNCLE_COUNT_BY_BLOCK_HASH}` ? [BlockHash] : T extends `${RPCMethodName.GET_BLOCK_TRANSACTION_COUNT_BY_NUMBER}` | `${RPCMethodName.GET_UNCLE_COUNT_BY_BLOCK_NUMBER}` ? [BlockTag] : T extends `${RPCMethodName.GET_CODE}` ? [Address, BlockTag] : T extends `${RPCMethodName.SEND_RAW_TRANSACTION}` ? [Signature] : T extends `${RPCMethodName.CALL}` | `${RPCMethodName.ESTIMATE_GAS}` ? [TransactionRequest] : T extends `${RPCMethodName.GET_BLOCK_BY_HASH}` ? [BlockHash, boolean] : T extends `${RPCMethodName.GET_BLOCK_BY_NUMBER}` ? [BlockTag, boolean] : T extends `${RPCMethodName.GET_TRANSACTION_BY_HASH}` ? [TransactionHash] : T extends `${RPCMethodName.GET_TRANSACTION_BY_BLOCK_HASH_AND_INDEX}` ? [BlockHash, Index] : T extends `${RPCMethodName.GET_TRANSACTION_BY_BLOCK_NUMBER_AND_INDEX}` ? [BlockTag, Index] : T extends `${RPCMethodName.GET_TRANSACTION_BY_BLOCK_NUMBER_AND_INDEX}` ? [BlockTag, Index] : T extends `${RPCMethodName.GET_TRANSACTION_RECEIPT}` ? [TransactionHash] : T extends `${RPCMethodName.GET_UNCLE_BY_BLOCK_HASH_AND_INDEX}` ? [BlockHash, Index] : T extends `${RPCMethodName.GET_UNCLE_BY_BLOCK_NUMBER_AND_INDEX}` ? [BlockTag, Index] : T extends `${RPCMethodName.NEW_FILTER}` ? [Filter] : T extends `${RPCMethodName.UNINSTALL_FILTER}` | `${RPCMethodName.GET_FILTER_CHANGES}` | `${RPCMethodName.GET_FILTER_LOGS}` ? [FilterId] : null;
export type WallyResponse<T> = T extends `${WallyMethodName.PERSONAL_SIGN}` | `${WallyMethodName.SIGN}` | `${WallyMethodName.SIGN_TYPED}` | `${WallyMethodName.SIGN_TYPED_V4}` | `${WallyMethodName.SIGN_TRANSACTION}` | `${WallyMethodName.SEND_TRANSACTION}` ? HexString : T extends `${WallyMethodName.ACCOUNTS}` | `${WallyMethodName.REQUEST_ACCOUNTS}` ? string[] : null;
export type RPCResponse<T> = T extends `${RPCMethodName.NET_LISTENING}` ? boolean : T extends `${RPCMethodName.SYNCING}` ? boolean : T extends `${RPCMethodName.UNINSTALL_FILTER}` ? boolean : T extends `${RPCMethodName.WEB3_CLIENT_VERSION}` ? string : T extends `${RPCMethodName.NET_VERSION}` | `${RPCMethodName.PROFOCOL_VERSION}` | `${RPCMethodName.GAS_PRICE}` | `${RPCMethodName.BLOCK_NUMBER}` | `${RPCMethodName.GET_BALANCE}` | `${RPCMethodName.GET_TRANSACTION_COUNT}` | `${RPCMethodName.GET_STORAGE_AT}` | `${RPCMethodName.GET_BLOCK_TRANSACTION_COUNT_BY_HASH}` | `${RPCMethodName.GET_UNCLE_COUNT_BY_BLOCK_HASH}` | `${RPCMethodName.GET_BLOCK_TRANSACTION_COUNT_BY_NUMBER}` | `${RPCMethodName.GET_UNCLE_COUNT_BY_BLOCK_NUMBER}` | `${RPCMethodName.GET_CODE}` | `${RPCMethodName.CALL}` | `${RPCMethodName.ESTIMATE_GAS}` | `${RPCMethodName.GET_UNCLE_BY_BLOCK_HASH_AND_INDEX}` | `${RPCMethodName.GET_UNCLE_BY_BLOCK_NUMBER_AND_INDEX}` | `${RPCMethodName.NEW_FILTER}` | `${RPCMethodName.NEW_BLOCK_FILTER}` | `${RPCMethodName.NEW_PENDING_TRANSACTION_FILTER}` | `${RPCMethodName.CHAIN_ID}` ? HexString : T extends `${RPCMethodName.GET_FILTER_CHANGES}` ? HexString[] : T extends `${RPCMethodName.SEND_RAW_TRANSACTION}` ? TransactionHash : T extends `${RPCMethodName.GET_BLOCK_BY_HASH}` | `${RPCMethodName.GET_BLOCK_BY_NUMBER}` ? Block : T extends `${RPCMethodName.GET_TRANSACTION_BY_HASH}` | `${RPCMethodName.GET_TRANSACTION_BY_BLOCK_HASH_AND_INDEX}` | `${RPCMethodName.GET_TRANSACTION_BY_BLOCK_NUMBER_AND_INDEX}` | `${RPCMethodName.GET_TRANSACTION_BY_BLOCK_NUMBER_AND_INDEX}` ? TransactionResponse : T extends `${RPCMethodName.GET_TRANSACTION_RECEIPT}` ? TransactionReceipt : T extends `${RPCMethodName.GET_FILTER_LOGS}` ? any : null;
export type MethodResponse<T> = WallyResponse<T> | RPCResponse<T>;
export {};
