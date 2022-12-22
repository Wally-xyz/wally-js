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
class Auth {
    constructor({ authToken, clientId, disableRedirectClose, host, messenger, redirectURL, _isDevelopment, _onTokenFetched, }) {
        this.didHandleRedirect = false;
        this.clientId = clientId;
        this.disableRedirectClose = !!disableRedirectClose;
        this.isDevelopment = !!_isDevelopment;
        this.onTokenFetched = _onTokenFetched;
        this.redirectUrl = redirectURL;
        this.host = host;
        this.messenger = messenger;
        this.isLoggingIn = false;
        this.selectedAddress = '';
        if (authToken) {
            this.setAuthToken(authToken);
        }
    }
    login(email) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isLoggingIn) {
                return Promise.reject('Already logging in.');
            }
            this.isLoggingIn = true;
            if (!this.clientId) {
                console.error('Please set a client ID');
                return;
            }
            const state = this.generateStateCode();
            this.saveState(state);
            const redirectUrl = this.redirectUrl || null;
            const queryParams = new URLSearchParams(Object.assign(Object.assign({ clientId: this.clientId, state }, ((redirectUrl && { redirectUrl }) || {})), ((email && { email }) || {})));
            window.open(`${this.host}/oauth/otp?${queryParams.toString()}`, '_blank');
            return new Promise((resolve, reject) => {
                const listener = () => {
                    this.messenger.removeListener(types_1.EmitterMessage.ACCOUNTS_CHANGED, listener);
                    resolve();
                };
                this.messenger.addListener(types_1.EmitterMessage.ACCOUNTS_CHANGED, listener);
                const logFailure = () => {
                    console.error('Error logging in to Wally. ☹️\nPlease refresh and try again.');
                };
                this.messenger.onWorkerMessage(types_1.WorkerMessage.LOGIN_SUCCESS, () => {
                    // TODO: This needs to use the emitter. Will fix after restructuring/splitting up.
                    if (!this.getToken()) {
                        logFailure();
                        reject(new Error('Token not found'));
                        return;
                    }
                    resolve();
                });
                this.messenger.onWorkerMessage(types_1.WorkerMessage.LOGIN_FAILURE, () => {
                    logFailure();
                    reject(new Error('Could not log in, please try again'));
                });
            });
        });
    }
    isRedirected() {
        return this.getState() !== null;
    }
    handleRedirect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.didHandleRedirect) {
                return;
            }
            this.didHandleRedirect = true;
            const storedState = this.getState();
            const queryParams = new URLSearchParams(window.location.search);
            if (storedState && storedState !== queryParams.get('state')) {
                this.deleteState();
                return Promise.reject(new Error('Invalid wally state'));
            }
            this.deleteState();
            const authCode = queryParams.get('authorization_code');
            let resp;
            let error = null;
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
                    this.selectedAddress = data.wallet;
                    this.onTokenFetched && this.onTokenFetched(data.wallet);
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
                this.messenger.sendWorkerMessage(types_1.WorkerMessage.LOGIN_FAILURE);
                return;
            }
            this.messenger.sendWorkerMessage(types_1.WorkerMessage.LOGIN_SUCCESS);
            if (!this.disableRedirectClose) {
                window.setTimeout(window.close, 1000);
            }
        });
    }
    setAuthToken(authToken) {
        localStorage.setItem(`wally:${this.clientId}:token`, authToken);
    }
    getToken() {
        return localStorage.getItem(`wally:${this.clientId}:token`);
    }
    clearAuthToken() {
        localStorage.removeItem(`wally:${this.clientId}:token`);
    }
    generateStateCode(length = 10) {
        const chars = [];
        for (let i = 0; i < 26; i++) {
            chars.push(String.fromCharCode('a'.charCodeAt(0) + i));
            chars.push(String.fromCharCode('A'.charCodeAt(0) + i));
        }
        for (let i = 0; i < 10; i++) {
            chars.push(String.fromCharCode('0'.charCodeAt(0) + i));
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
}
exports.default = Auth;
//# sourceMappingURL=auth.js.map