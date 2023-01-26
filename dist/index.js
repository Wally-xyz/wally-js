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
exports.clearInstance = exports.logout = exports.finishLogin = exports.login = exports.getProvider = exports.init = void 0;
const wally_js_1 = __importDefault(require("./wally-js"));
let wally = null;
const checkInjected = (supress) => {
    if (!wally) {
        if (!supress) {
            console.error("Couldn't find wally instance. Ensure init() method is called first.");
        }
        return false;
    }
    return true;
};
const init = (options) => {
    if (typeof window === 'undefined') {
        console.error('Ensure init() is called on the client only.');
        return;
    }
    wally = wally || new wally_js_1.default(options);
    if (wally.isRedirected()) {
        wally.handleRedirect();
    }
    return wally;
};
exports.init = init;
const getProvider = (supress) => {
    if (!checkInjected(supress)) {
        return null;
    }
    return wally;
};
exports.getProvider = getProvider;
/**
 * Must be used if `disableLoginOnRequest` is true.
 * Can optionally pass in an email to sign up. [wip]
 * @param email
 * @returns
 */
const login = (email) => __awaiter(void 0, void 0, void 0, function* () {
    if (!checkInjected() || (wally && wally.isLoggedIn())) {
        return Promise.reject(new Error('No wally instance or already logged in'));
    }
    return wally.login(email);
});
exports.login = login;
const finishLogin = (address) => {
    if (!checkInjected()) {
        return;
    }
    wally.finishLogin(address);
};
exports.finishLogin = finishLogin;
const logout = () => {
    wally === null || wally === void 0 ? void 0 : wally.logout();
};
exports.logout = logout;
const clearInstance = () => {
    wally = null;
};
exports.clearInstance = clearInstance;
exports.default = wally_js_1.default;
//# sourceMappingURL=index.js.map