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
exports.WallyConnector = void 0;
const constants_1 = require("./constants");
var MethodName;
(function (MethodName) {
    MethodName["eth_requestAccounts"] = "eth_requestAccounts";
    MethodName["personal_sign"] = "personal_sign";
    MethodName["eth_getBalance"] = "eth_getBalance";
})(MethodName || (MethodName = {}));
class WallyConnector {
    constructor(clientId, options) {
        var _a;
        this.clientId = clientId;
        this.options = options;
        this.host = ((_a = this.options) === null || _a === void 0 ? void 0 : _a.isDevelopment)
            ? 'http://localhost:8888/v1'
            : 'https://api.wally.xyz';
        this.selectedAddress = null;
    }
    loginWithEmail() {
        return __awaiter(this, void 0, void 0, function* () {
            const state = this.generateStateCode();
            this.saveState(state);
            const queryParams = new URLSearchParams({ clientId: this.clientId, state });
            window.open(`${this.host}/oauth/otp?${queryParams.toString()}`, '_blank', `popup,width=600,height=600,\
      top=${window.screenY + 100},left=${window.screenX + 100}`);
            const scrim = document.createElement('div');
            scrim.setAttribute('style', constants_1.SCRIM_STYLES);
            document.body.appendChild(scrim);
            return new Promise((resolve) => {
                window.addEventListener('storage', (e) => {
                    console.log('storage', { e });
                    if (!this.getAuthToken()) {
                        return;
                    }
                    resolve();
                    document.body.removeChild(scrim);
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
    handleRedirect() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const storedState = this.getState();
            const queryParams = new URLSearchParams(window.location.search);
            if (storedState && storedState !== queryParams.get('state')) {
                this.deleteState();
                if ((_a = this.options) === null || _a === void 0 ? void 0 : _a.isDevelopment) {
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
                }
                else {
                    this.deleteState();
                    console.error('The Wally server returned a non-successful response when exchanging authorization code for token');
                }
            }
            catch (err) {
                console.error(`Unable to fetch Wally access token: ${err}`);
                this.deleteState();
            }
        });
    }
    /**
     * Sensitive things:
     * - clientId
     * - host
     * - isDevelopment
     * @returns
     */
    static handleRedirect(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!clientId) {
                return;
            }
            const storedState = WallyConnector.getState(clientId);
            const queryParams = new URLSearchParams(window.location.search);
            if (storedState && storedState !== queryParams.get('state')) {
                WallyConnector.deleteState(clientId);
                // if (this.options?.isDevelopment) {
                console.error('Invalid Wally state');
                // }
            }
            WallyConnector.deleteState(clientId);
            const authCode = queryParams.get('authorization_code');
            let resp;
            try {
                // resp = await fetch(`${this.host}/oauth/token`, {
                resp = yield fetch(`http://localhost:8888/v1/oauth/token`, {
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
                    WallyConnector.setAuthToken(clientId, data.token);
                }
                else {
                    WallyConnector.deleteState(clientId);
                    console.error('The Wally server returned a non-successful response when exchanging authorization code for token');
                }
            }
            catch (err) {
                console.error(`Unable to fetch Wally access token: ${err}`);
                WallyConnector.deleteState(clientId);
            }
        });
    }
    setAuthToken(authToken) {
        localStorage.setItem(`wally:${this.clientId}:token`, authToken);
    }
    getAuthToken() {
        return localStorage.getItem(`wally:${this.clientId}:token`);
    }
    static setAuthToken(clientId, authToken) {
        localStorage.setItem(`wally:${clientId}:token`, authToken);
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
        return WallyConnector.getState(this.clientId);
    }
    deleteState() {
        WallyConnector.deleteState(this.clientId);
    }
    static getState(clientId) {
        return localStorage.getItem(`wally:${clientId}:state:token`);
    }
    static deleteState(clientId) {
        localStorage.removeItem(`wally:${clientId}:state:token`);
    }
    request(req) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isLoggedIn()) {
                yield this.loginWithEmail();
            }
            switch (req.method) {
                case 'eth_requestAccounts':
                    return this.requestAccounts();
                case 'personal_sign':
                    return this.signMessage(req.params);
                case MethodName.eth_getBalance:
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
                    return [this.selectedAddress];
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
exports.WallyConnector = WallyConnector;
//# sourceMappingURL=index.js.map