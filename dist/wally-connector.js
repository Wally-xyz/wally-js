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
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const constants_1 = require("./constants");
class WallyConnector {
    constructor({ clientId, isDevelopment, devUrl }) {
        this.clientId = clientId;
        this.host = (isDevelopment && devUrl) || constants_1.APP_ROOT;
        this.selectedAddress = null;
        this.isDevelopment = !!isDevelopment;
        this.didHandleRedirect = false;
        // todo - make path configurable, node_modules maybe?
        this.worker = SharedWorker ? new SharedWorker('/sdk/worker.js') : null;
        this.connectToSharedWorker();
        this.workerCallbacks = {};
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
    loginWithEmail() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.clientId) {
                return;
            }
            const state = this.generateStateCode();
            this.saveState(state);
            const queryParams = new URLSearchParams({ clientId: this.clientId, state });
            window.open(`${this.host}/oauth/otp?${queryParams.toString()}`, '_blank');
            const scrim = (0, constants_1.getScrimElement)();
            document.body.appendChild(scrim);
            return new Promise((resolve, reject) => {
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
                    document.body.removeChild(scrim);
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
                    if (this.worker) {
                        this.worker.port.postMessage(types_1.WorkerMessage.LOGIN_SUCCESS);
                    }
                    else {
                        const caption = document.getElementById(constants_1.REDIRECT_CAPTION_ID);
                        caption
                            ? (caption.innerText =
                                'Success. You may now close this page and refresh the app.')
                            : {};
                    }
                }
                else {
                    this.deleteState();
                    console.error('The Wally server returned a non-successful response when exchanging authorization code for token');
                    this.worker
                        ? this.worker.port.postMessage(types_1.WorkerMessage.LOGIN_FAILURE)
                        : {};
                }
            }
            catch (err) {
                console.error(`Unable to fetch Wally access token: ${err}`);
                this.deleteState();
                this.worker
                    ? this.worker.port.postMessage(types_1.WorkerMessage.LOGIN_FAILURE)
                    : {};
            }
            if (closeWindow && this.worker) {
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
    request(req) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isLoggedIn()) {
                yield this.loginWithEmail();
            }
            switch (req.method) {
                case types_1.MethodName.REQUEST_ACCOUNTS:
                    return this.requestAccounts();
                // TODO: figure out which name to use
                case types_1.MethodName.PERSONAL_SIGN:
                case types_1.MethodName.SIGN:
                    return this.signMessage(req.params);
                case types_1.MethodName.GET_BALANCE:
                    return this._request(req.method, req.params);
            }
        });
    }
    requestAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            let resp;
            try {
                resp = yield fetch(`${this.host}/oauth/me`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${this.getAuthToken()}`,
                    },
                });
                if (resp && (resp === null || resp === void 0 ? void 0 : resp.ok) && (resp === null || resp === void 0 ? void 0 : resp.status) < 300) {
                    const data = yield resp.json();
                    this.selectedAddress = data.address;
                    return [this.selectedAddress || ''];
                }
                else {
                    console.error('The Wally server returned a non-successful response when fetching wallet details');
                }
            }
            catch (err) {
                console.error(`Unable to fetch Wally wallet: ${err}`);
            }
            return [];
        });
    }
    signMessage(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield fetch(`${this.host}/oauth/wallet/sign-message`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.getAuthToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: params[1],
                }),
            });
            if (!resp.ok || resp.status >= 300) {
                throw new Error('Wally server returned a non-successful response when signing a message');
            }
            const json = yield resp.json();
            return json.signature;
        });
    }
    /**
     * Handle other non-wally-specific methods - forwards to ethers/alchemy
     * on the backend
     * @param method The RPC Method
     * @param params Arbitrary array of params
     * @returns whatever you want it to
     */
    _request(method, params) {
        return __awaiter(this, void 0, void 0, function* () {
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
                throw new Error('Wally server returned a non-successful response when signing a message');
            }
            const body = yield resp.text();
            return body;
        });
    }
}
exports.default = WallyConnector;
//# sourceMappingURL=wally-connector.js.map