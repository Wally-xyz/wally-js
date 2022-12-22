"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const types_1 = require("./types");
class Requester {
    constructor({ clientId, verbose, host, auth, messenger }) {
        this.clientId = clientId;
        this.verbose = !!verbose;
        this.host = host;
        this.auth = auth;
        this.messenger = messenger;
    }
    isWallyMethod(name) {
        return Object.values(types_1.WallyMethodName).indexOf(name) > -1;
    }
    isRPCMethod(name) {
        return Object.values(types_1.RPCMethodName).indexOf(name) > -1;
    }
    /**
     * This is the major exposed method for supporting JSON RPC methods
     * and associated wallet/blockchain functionality.
     * There are two main types of requests: those that require wallet info
     * (address, signing), and those that do not (gas prices, last block).
     * We route the former to customized endpoints on the backend that handle
     * this extra wallet fetching and logic, and the latter to an endpoint
     * that essentially works as a passthrough to ethers/alchemy.
     *
     * TODO: Move requesting logic and helpers to separate file/module
     * @param req
     * @param req.method - the name of the RPC method
     * @param req.params - the required parameters for the method
     * @returns Promise<MethodResponse> | null
     * @see https://ethereum.org/en/developers/docs/apis/json-rpc/#json-rpc-methods
     */
    request(req) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.verbose) {
                console.log(`wally requesting: ${req.method} w/ params: ${req.params || 'none'}`);
            }
            if (!this.auth.getToken()) {
                // bandaid for courtyard, etc.
                // (eth_accounts might just be for checking loggedin status)
                if (req.method === types_1.WallyMethodName.ACCOUNTS) {
                    return Promise.resolve([]);
                }
                else if (this.isWallyMethod(req.method)) {
                    return this.deferredRequest(req);
                }
            }
            let res;
            if (this.isWallyMethod(req.method)) {
                res = this.requestWally(req.method, 'params' in req ? req.params : undefined);
            }
            else if (this.isRPCMethod(req.method)) {
                res = this.requestRPC(req.method, 'params' in req ? req.params : undefined);
            }
            else {
                console.warn(`Method: ${req.method} is not officially supported by wally at this time, use at your own risk! Contact the wally team to get it prioritized.`);
                res = this.requestRPC(req.method, 'params' in req ? req.params : undefined);
            }
            if (this.verbose) {
                console.log('wally response:', { res });
            }
            return res;
        });
    }
    /**
     * The promise for handling when trying to make a request before the user has
     * logged in. Either:
     * - trigger a login once (web3 standard), and trigger the request after the
     *   login is complete (adding requests in the meantime to the emitter queue) OR
     * - just add all requests to the emitter queue, waiting for the consumer to manually login.
     * TODO: explore converting to async/await with callbacks to prevent indefinite blocking while
     * waiting for a message that may potentially never come.
     * @param req RequestObj
     * @returns Promise
     */
    deferredRequest(req) {
        return new Promise((resolve, reject) => {
            if (!this.auth.isLoggingIn) {
                this.auth.login().then(() => {
                    resolve(this.request(req));
                });
            }
            else {
                const listener = () => {
                    this.messenger.removeListener(types_1.EmitterMessage.ACCOUNTS_CHANGED, listener);
                    resolve(this.request(req));
                };
                this.messenger.addListener(types_1.EmitterMessage.ACCOUNTS_CHANGED, listener);
            }
        });
    }
    formatWallyParams(method, params) {
        switch (method) {
            case types_1.WallyMethodName.SIGN:
                return JSON.stringify({ message: params[1] });
            case types_1.WallyMethodName.PERSONAL_SIGN:
                return JSON.stringify({ message: params[0] });
            case types_1.WallyMethodName.SIGN_TYPED:
            case types_1.WallyMethodName.SIGN_TYPED_V4: {
                // NOTE: Requests from opensea are already a json string
                const data = params[1];
                if (typeof data === 'string') {
                    return data;
                }
                else
                    return JSON.stringify(data);
            }
            case types_1.WallyMethodName.SEND_TRANSACTION:
            case types_1.WallyMethodName.SIGN_TRANSACTION: {
                const _a = params[0], { gas, gasLimit } = _a, txn = __rest(_a, ["gas", "gasLimit"]);
                return JSON.stringify(Object.assign(Object.assign({}, txn), { gasLimit: gasLimit || gas }));
            }
            default:
                return JSON.stringify(params);
        }
    }
    isJSONContentType(method) {
        return ([
            types_1.WallyMethodName.SIGN,
            types_1.WallyMethodName.PERSONAL_SIGN,
            types_1.WallyMethodName.SIGN_TYPED,
            types_1.WallyMethodName.SIGN_TYPED_V4,
            types_1.WallyMethodName.SIGN_TRANSACTION,
            types_1.WallyMethodName.SEND_TRANSACTION,
        ].indexOf(method) > -1);
    }
    formatWallyResponse(method, data) {
        switch (method) {
            case types_1.WallyMethodName.ACCOUNTS:
            case types_1.WallyMethodName.REQUEST_ACCOUNTS: {
                const { address } = data;
                this.auth.selectedAddress = address;
                return [address];
            }
            case types_1.WallyMethodName.SIGN:
            case types_1.WallyMethodName.PERSONAL_SIGN:
            case types_1.WallyMethodName.SIGN_TRANSACTION:
            case types_1.WallyMethodName.SIGN_TYPED:
            case types_1.WallyMethodName.SIGN_TYPED_V4: {
                const { signature } = data;
                return signature;
            }
            case types_1.WallyMethodName.SEND_TRANSACTION: {
                const { hash } = data;
                return hash;
            }
        }
        return null;
    }
    /**
     * Method used doing wallet-related actions like requesting accounts
     * and signing things - actions that require wallet/private key access
     * and are basically the core wally value prop.
     * @param method The RPC method name associated with the wally api call
     * @param params The json rpc spec params (*not* wally's spec)
     * @returns WallyResponse - adheres to the json rpc spec
     */
    requestWally(method, params) {
        return __awaiter(this, void 0, void 0, function* () {
            let resp;
            try {
                resp = yield fetch(`${this.host}/oauth/${constants_1.WALLY_ROUTES[method]}`, Object.assign({ method: 'POST', headers: Object.assign({ Authorization: `Bearer ${this.auth.getToken()}` }, (this.isJSONContentType(method)
                        ? { 'Content-Type': 'application/json' }
                        : {})) }, (params &&
                    params.length > 0 && {
                    body: this.formatWallyParams(method, params),
                })));
                if (resp && (resp === null || resp === void 0 ? void 0 : resp.ok) && (resp === null || resp === void 0 ? void 0 : resp.status) < 300) {
                    const data = yield resp.json();
                    return this.formatWallyResponse(method, data);
                }
                else {
                    console.error(`The Wally server returned a non-successful response when handling method: ${method}`);
                }
            }
            catch (err) {
                console.error(`Wally server returned error: ${err} when handling method: ${method}`);
            }
            return Promise.reject(new Error(`Invalid response for ${method}`));
        });
    }
    /**
     * Handle other non-wally-specific methods - forwards to ethers/alchemy
     * on the backend
     * @param method The RPC method name
     * @param params The json rpc spec params
     * @returns RPCResponse - adheres to the json rpc spec
     */
    requestRPC(method, params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const resp = yield fetch(`${this.host}/oauth/wallet/send`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${this.auth.getToken()}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        method,
                        params,
                        clientId: this.clientId,
                    }),
                });
                if (!resp.ok || resp.status >= 300) {
                    console.error(`Wally server returned a non-successful response when handling method: ${method}`);
                }
                else {
                    const contentType = resp.headers.get('content-type');
                    if (contentType && contentType.indexOf('application/json') !== -1) {
                        const json = yield resp.json();
                        return json;
                    }
                    else {
                        const text = yield resp.text();
                        return text;
                    }
                }
            }
            catch (err) {
                console.error(`Wally server returned error: ${err} when handling method: ${method}`);
            }
            return Promise.reject(new Error(`Invalid response for ${method}`));
        });
    }
}
exports.default = Requester;
//# sourceMappingURL=requester.js.map