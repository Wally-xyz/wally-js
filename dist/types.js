"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsupportedMethodName = exports.RPCMethodName = exports.WallyMethodName = exports.WorkerMessage = void 0;
var WorkerMessage;
(function (WorkerMessage) {
    WorkerMessage["LOGIN_SUCCESS"] = "login-success";
    WorkerMessage["LOGIN_FAILURE"] = "login-failure";
})(WorkerMessage = exports.WorkerMessage || (exports.WorkerMessage = {}));
// "RPC" methods that need information from wally
// NOTE: SIGN, PERSONAL_SIGN, and SIGN_TYPED all have different metamask versions
var WallyMethodName;
(function (WallyMethodName) {
    WallyMethodName["ACCOUNTS"] = "eth_accounts";
    WallyMethodName["REQUEST_ACCOUNTS"] = "eth_requestAccounts";
    WallyMethodName["PERSONAL_SIGN"] = "personal_sign";
    WallyMethodName["SIGN"] = "eth_sign";
    WallyMethodName["SIGN_TYPED"] = "eth_signTypedData";
    WallyMethodName["SIGN_TYPED_V4"] = "eth_signTypedData_v4";
    WallyMethodName["SIGN_TRANSACTION"] = "eth_signTransaction";
    WallyMethodName["SEND_TRANSACTION"] = "eth_sendTransaction";
})(WallyMethodName = exports.WallyMethodName || (exports.WallyMethodName = {}));
// RPC methods that go directly to alchemy
var RPCMethodName;
(function (RPCMethodName) {
    RPCMethodName["WEB3_CLIENT_VERSION"] = "web3_clientVersion";
    RPCMethodName["WEB3_SHA"] = "web3_sha3";
    RPCMethodName["NET_VERSION"] = "net_version";
    RPCMethodName["NET_LISTENING"] = "net_listening";
    RPCMethodName["PROFOCOL_VERSION"] = "eth_protocolVersion";
    RPCMethodName["SYNCING"] = "eth_syncing";
    RPCMethodName["GAS_PRICE"] = "eth_gasPrice";
    RPCMethodName["BLOCK_NUMBER"] = "eth_blockNumber";
    RPCMethodName["GET_BALANCE"] = "eth_getBalance";
    RPCMethodName["GET_STORAGE_AT"] = "eth_getStorageAt";
    RPCMethodName["GET_TRANSACTION_COUNT"] = "eth_getTransactionCount";
    RPCMethodName["GET_BLOCK_TRANSACTION_COUNT_BY_HASH"] = "eth_getBlockTransactionCountByHash";
    RPCMethodName["GET_BLOCK_TRANSACTION_COUNT_BY_NUMBER"] = "eth_getBlockTransactionCountByNumber";
    RPCMethodName["GET_UNCLE_COUNT_BY_BLOCK_HASH"] = "eth_getUncleCountByBlockHash";
    RPCMethodName["GET_UNCLE_COUNT_BY_BLOCK_NUMBER"] = "eth_getUncleCountByBlockNumber";
    RPCMethodName["GET_CODE"] = "eth_getCode";
    RPCMethodName["SEND_RAW_TRANSACTION"] = "eth_sendRawTransaction";
    RPCMethodName["CALL"] = "eth_call";
    RPCMethodName["ESTIMATE_GAS"] = "eth_estimateGas";
    RPCMethodName["GET_BLOCK_BY_HASH"] = "eth_getBlockByHash";
    RPCMethodName["GET_BLOCK_BY_NUMBER"] = "eth_getBlockByNumber";
    RPCMethodName["GET_TRANSACTION_BY_HASH"] = "eth_getTransactionByHash";
    RPCMethodName["GET_TRANSACTION_BY_BLOCK_HASH_AND_INDEX"] = "eth_getTransactionByBlockHashAndIndex";
    RPCMethodName["GET_TRANSACTION_BY_BLOCK_NUMBER_AND_INDEX"] = "eth_getTransactionByBlockNumberAndIndex";
    RPCMethodName["GET_TRANSACTION_RECEIPT"] = "eth_getTransactionReceipt";
    RPCMethodName["GET_UNCLE_BY_BLOCK_HASH_AND_INDEX"] = "eth_getUncleByBlockHashAndIndex";
    RPCMethodName["GET_UNCLE_BY_BLOCK_NUMBER_AND_INDEX"] = "eth_getUncleByBlockNumberAndIndex";
    RPCMethodName["NEW_FILTER"] = "eth_newFilter";
    RPCMethodName["NEW_BLOCK_FILTER"] = "eth_newBlockFilter";
    RPCMethodName["NEW_PENDING_TRANSACTION_FILTER"] = "eth_newPendingTransactionFilter";
    RPCMethodName["UNINSTALL_FILTER"] = "eth_uninstallFilter";
    RPCMethodName["GET_FILTER_CHANGES"] = "eth_getFilterChanges";
    RPCMethodName["GET_FILTER_LOGS"] = "eth_getFilterLogs";
    RPCMethodName["GET_LOGS"] = "eth_getLogs";
    RPCMethodName["CHAIN_ID"] = "eth_chainId";
})(RPCMethodName = exports.RPCMethodName || (exports.RPCMethodName = {}));
// More popular unsupported methods for more explicit error handling
// TBH might not even need this definition
var UnsupportedMethodName;
(function (UnsupportedMethodName) {
    UnsupportedMethodName["NET_PEERCOUNT"] = "net_peerCount";
    UnsupportedMethodName["COINBASE"] = "eth_coinbase";
    UnsupportedMethodName["MINING"] = "eth_mining";
    UnsupportedMethodName["HASHRATE"] = "eth_hashrate";
    UnsupportedMethodName["GET_COMPILERS"] = "eth_getCompilers";
    UnsupportedMethodName["COMPILE_SOLIDITY"] = "eth_compileSolidity";
    UnsupportedMethodName["COMPILE_LLL"] = "eth_compileLLL";
    UnsupportedMethodName["COMPILE_SERPEND"] = "eth_compileSerpent";
    UnsupportedMethodName["GET_WORK"] = "eth_getWork";
    UnsupportedMethodName["SUBMIT_WORK"] = "eth_submitWork";
    UnsupportedMethodName["SUBMIT_HASHRATE"] = "eth_sumbitHashrate";
})(UnsupportedMethodName = exports.UnsupportedMethodName || (exports.UnsupportedMethodName = {}));
//# sourceMappingURL=types.js.map