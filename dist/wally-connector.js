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
const types_1 = require("./types");
const constants_1 = require("./constants");
// import { TransactionRequest } from '@ethersproject/providers';
class WallyConnector {
    constructor({ clientId, isDevelopment, devUrl, token, verbose, }) {
        this.clientId = clientId;
        this.host = (isDevelopment && devUrl) || constants_1.APP_ROOT;
        this.selectedAddress = null;
        this.isDevelopment = !!isDevelopment;
        this.didHandleRedirect = false;
<<<<<<< HEAD
        this.verbose = !!verbose;
=======
        this.rejectLogin = null;
>>>>>>> 85675f9 (build)
        // todo - make path configurable, node_modules maybe?
        this.worker = SharedWorker ? new SharedWorker('/sdk/worker.js') : null;
        this.connectToSharedWorker();
        this.workerCallbacks = {};
        if (token) {
            if (!isDevelopment) {
                console.error('Token may only be used in development mode.');
            }
            else {
                if (verbose) {
                    console.log('Setting auth token');
                }
                this.setAuthToken(token);
            }
        }
    }
    connectToSharedWorker() {
        if (!this.worker) {
            console.error('SharedWorker not available, falling back to less-than-ideal experience.');
            return;
        }
        this.worker.port.start();
        this.worker.port.onmessage = (e) => {
            this.handleWorkerMessage(e.data);
        };
    }
    handleWorkerMessage(message) {
        var _a;
        if (!this.worker) {
            return;
        }
        (_a = this.workerCallbacks[message]) === null || _a === void 0 ? void 0 : _a.forEach((cb) => cb());
    }
    onWorkerMessage(message, fn) {
        var _a;
        if (!this.worker) {
            return;
        }
        if (!this.workerCallbacks[message]) {
            this.workerCallbacks[message] = [];
        }
        (_a = this.workerCallbacks[message]) === null || _a === void 0 ? void 0 : _a.push(fn);
    }
    onScrimCloseButton() {
        const scrim = document.getElementById(constants_1.SCRIM_ID);
        scrim && scrim.parentElement && scrim.parentElement.removeChild(scrim);
        this.rejectLogin && this.rejectLogin();
    }
    loginWithEmail() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.clientId) {
                console.error('Please set a client ID');
                return;
            }
            const state = this.generateStateCode();
            this.saveState(state);
            const queryParams = new URLSearchParams({ clientId: this.clientId, state });
            window.open(`${this.host}/oauth/otp?${queryParams.toString()}`, '_blank');
            const scrim = (0, constants_1.getScrimElement)();
            document.body.appendChild(scrim);
            return new Promise((resolve, reject) => {
                this.rejectLogin = reject;
                const updateFailureScrim = () => {
                    const scrimText = document.getElementById(constants_1.SCRIM_TEXT_ID);
                    scrimText
                        ? (scrimText.innerText =
                            'Error logging in. ☹️\nPlease refresh and try again.')
                        : {};
                };
                this.onWorkerMessage(types_1.WorkerMessage.LOGIN_SUCCESS, () => {
                    if (!this.getAuthToken()) {
                        updateFailureScrim();
                        reject();
                        return;
                    }
                    resolve();
                    const scrim = document.getElementById(constants_1.SCRIM_ID);
                    scrim && scrim.parentElement && scrim.parentElement.removeChild(scrim);
                });
                this.onWorkerMessage(types_1.WorkerMessage.LOGIN_FAILURE, () => {
                    updateFailureScrim();
                    reject();
                });
            });
        });
    }
    isRedirected() {
        return this.getState() !== null;
    }
    isLoggedIn() {
        return !!this.getAuthToken();
    }
    handleRedirect({ closeWindow = false, appendContent = false, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.didHandleRedirect) {
                return;
            }
            this.didHandleRedirect = true;
            if (appendContent) {
                document.body.appendChild((0, constants_1.getRedirectPage)());
            }
            const storedState = this.getState();
            const queryParams = new URLSearchParams(window.location.search);
            if (storedState && storedState !== queryParams.get('state')) {
                this.deleteState();
                if (this.isDevelopment) {
                    console.error('Invalid Wally state');
                }
            }
            this.deleteState();
            const authCode = queryParams.get('authorization_code');
            let resp;
            let error = null;
            const caption = document.getElementById(constants_1.REDIRECT_CAPTION_ID);
            try {
                resp = yield fetch(`${this.host}/oauth/token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        authCode,
                    }),
                });
                if (resp && (resp === null || resp === void 0 ? void 0 : resp.ok) && (resp === null || resp === void 0 ? void 0 : resp.status) < 300) {
                    const data = yield resp.json();
                    this.setAuthToken(data.token);
                }
                else {
                    error = yield resp.text();
                    console.error('The Wally server returned a non-successful response when exchanging authorization code for token');
                }
            }
            catch (err) {
                error = err;
                console.error(`Unable to fetch Wally access token: ${err}`);
            }
            if (error) {
                this.deleteState();
                this.worker
                    ? this.worker.port.postMessage(types_1.WorkerMessage.LOGIN_FAILURE)
                    : {};
                if (caption) {
                    caption.innerText = `Error retreiving token.\n${error.toString()}`;
                    caption.style.color = 'red';
                }
                return;
            }
            if (this.worker) {
                this.worker.port.postMessage(types_1.WorkerMessage.LOGIN_SUCCESS);
            }
            caption
                ? (caption.innerText =
                    'Success. You may now close this page and refresh the app.')
                : {};
            if (closeWindow) {
                window.setTimeout(window.close, 1000);
            }
        });
    }
    setAuthToken(authToken) {
        localStorage.setItem(`wally:${this.clientId}:token`, authToken);
    }
    getAuthToken() {
        return localStorage.getItem(`wally:${this.clientId}:token`);
    }
    generateStateCode(length = 10) {
        const chars = [];
        for (let i = 0; i < 26; i++) {
            chars.push(String.fromCharCode('a'.charCodeAt(0) + i));
            chars.push(String.fromCharCode('A'.charCodeAt(0) + i));
        }
        for (let i = 0; i < 10; i++) {
            chars.push('0'.charCodeAt(0) + i);
        }
        const authCode = [];
        for (let charCount = 0; charCount < length; charCount++) {
            const randInt = Math.floor(Math.random() * chars.length);
            authCode.push(chars[randInt]);
        }
        return authCode.join('');
    }
    saveState(state) {
        localStorage.setItem(`wally:${this.clientId}:state:token`, state);
    }
    getState() {
        return localStorage.getItem(`wally:${this.clientId}:state:token`);
    }
    deleteState() {
        localStorage.removeItem(`wally:${this.clientId}:state:token`);
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
            if (!this.isLoggedIn()) {
                yield this.loginWithEmail();
            }
            let res;
            if (this.isWallyMethod(req.method)) {
                res = this.requestWally(req.method, 'params' in req ? req.params : undefined);
            }
            else if (this.isRPCMethod(req.method)) {
                res = this.requestRPC(req.method, 'params' in req ? req.params : undefined);
            }
            else {
<<<<<<< HEAD
                console.warn(`Method: ${req.method} is not officially supported by wally at this time, use at your own risk! Contact the wally team to get it prioritized.`);
                res = this.requestRPC(req.method, 'params' in req ? req.params : undefined);
=======
                console.error(`Method: ${req.method} is not officially supported by wally at this time, use at your own risk! Contact wally support to get it prioritized.`);
                return this.requestRPC(req.method, 'params' in req ? req.params : undefined);
>>>>>>> 85675f9 (build)
            }
            if (this.verbose) {
                console.log('wally response:', { res });
            }
            return res;
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
                this.selectedAddress = address;
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
                resp = yield fetch(`${this.host}/oauth/${constants_1.WALLY_ROUTES[method]}`, Object.assign({ method: 'POST', headers: Object.assign({ Authorization: `Bearer ${this.getAuthToken()}` }, (this.isJSONContentType(method)
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
            return null;
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
                        Authorization: `Bearer ${this.getAuthToken()}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        method,
                        params,
                    }),
                });
                if (!resp.ok || resp.status >= 300) {
                    console.error(`Wally server returned a non-successful response when handling method: ${method}`);
                }
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
            catch (err) {
                console.error(`Wally server returned error: ${err} when handling method: ${method}`);
            }
            return null;
        });
    }
}
exports.default = WallyConnector;
//# sourceMappingURL=wally-connector.js.map