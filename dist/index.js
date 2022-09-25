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
class WallyConnector {
    constructor(clientId, options) {
        var _a;
        this.clientId = clientId;
        this.options = options;
        this.host = ((_a = this.options) === null || _a === void 0 ? void 0 : _a.isDevelopment) ? 'http://localhost:3000' : 'https://api.wally.xyz';
    }
    loginWithEmail() {
        var _a;
        const state = this.generateStateCode();
        this.saveState(state);
        const queryParams = new URLSearchParams({ clientId: this.clientId, state });
        window.location.replace(((_a = this.options) === null || _a === void 0 ? void 0 : _a.isDevelopment)
            ? `${this.host}/oauth/otp?${queryParams.toString()}`
            : `${this.host}/oauth/otp?${queryParams.toString()}`);
    }
    isRedirected() {
        return this.getState() !== null;
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
                if (resp && (!(resp === null || resp === void 0 ? void 0 : resp.ok) || (resp === null || resp === void 0 ? void 0 : resp.status) >= 300)) {
                    const data = yield resp.json();
                    this.setAuthToken(data.token);
                }
                else {
                    this.deleteState();
                    console.error('Wally server returned a non-successful response when exchanging authorization code for token');
                }
            }
            catch (err) {
                console.error(`Unable to fetch Wally access token: ${err}`);
                this.deleteState();
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
    signMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryString = new URLSearchParams({ message }).toString();
            const resp = yield fetch(`${this.host}/app/user/sign-message?${queryString}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${this.getAuthToken()}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            });
            if (!resp.ok || resp.status >= 300) {
                throw new Error('Wally server returned a non-successful response when signing a message');
            }
            return yield resp.json();
        });
    }
}
exports.WallyConnector = WallyConnector;
//# sourceMappingURL=index.js.map