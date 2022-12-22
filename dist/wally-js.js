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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const constants_1 = require("./constants");
const messenger_1 = __importDefault(require("./messenger"));
const auth_1 = __importDefault(require("./auth"));
const requester_1 = __importDefault(require("./requester"));
class WallyJS {
    constructor({ authToken, clientId, disableRedirectClose, redirectURL, sharedWorkerUrl, verbose, _devUrl, _disableSharedWorker, _isDevelopment, _onTokenFetched, }) {
        const host = (_isDevelopment && _devUrl) || constants_1.APP_ROOT;
        this.messenger = new messenger_1.default({
            sharedWorkerUrl,
            _disableSharedWorker,
        });
        this.auth = new auth_1.default({
            authToken,
            clientId,
            disableRedirectClose,
            redirectURL,
            _isDevelopment,
            _onTokenFetched,
            host,
            messenger: this.messenger,
        });
        this.requester = new requester_1.default({
            clientId,
            verbose,
            host,
            auth: this.auth,
            messenger: this.messenger,
        });
    }
    get selectedAddress() {
        return this.auth.selectedAddress;
    }
    finishLogin(address) {
        if (!this.auth.isLoggingIn) {
            return;
        }
        this.auth.isLoggingIn = false;
        this.messenger.emit(types_1.EmitterMessage.ACCOUNTS_CHANGED, address);
        this.messenger.emit(types_1.EmitterMessage.CONNECTED);
    }
    on(name, cb) {
        this.messenger.addListener(name, cb);
    }
    removeListener(name, fn) {
        this.messenger.removeListener(name, fn);
    }
    removeAllListeners(name) {
        this.messenger.removeAllListeners(name);
    }
    login(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.auth.login(email);
        });
    }
    logout() {
        this.auth.clearAuthToken();
    }
    isRedirected() {
        return this.auth.isRedirected();
    }
    isLoggedIn() {
        return !!this.auth.getToken();
    }
    handleRedirect() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.auth.handleRedirect();
        });
    }
    request(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.requester.request(req);
        });
    }
    /**
     * @deprecated use isLoggedIn()
     */
    isConnected() {
        return this.isLoggedIn();
    }
    /**
     * @deprecated use on()
     */
    addListener(name, cb) {
        this.on(name, cb);
    }
    /**
     * @deprecated - use request()
     */
    sendAsync(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request(req);
        });
    }
    /**
     * @deprecated - use request({ method: 'eth_requestAccounts' }) directly
     */
    enable() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request({ method: 'eth_requestAccounts' });
        });
    }
}
exports.default = WallyJS;
//# sourceMappingURL=wally-js.js.map