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
exports.finishLogin = exports.login = exports.getProvider = exports.init = void 0;
const wally_connector_1 = __importDefault(require("./wally-connector"));
const checkInjected = () => {
    if (!window.wally) {
        console.error("Couldn't find wally instance. Ensure init() method is called first.");
        return false;
    }
    return true;
};
const init = (options) => {
    if (typeof window === 'undefined') {
        console.error('Ensure init() is called on the client only.');
        return;
    }
    window.wally = window.wally || new wally_connector_1.default(options);
    if (window.wally.isRedirected()) {
        window.wally.handleRedirect();
    }
    return;
};
exports.init = init;
const getProvider = () => {
    if (!checkInjected()) {
        return null;
    }
    return window.wally;
};
exports.getProvider = getProvider;
const login = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!checkInjected() || window.wally.isLoggedIn()) {
        return Promise.reject();
    }
    return window.wally.login();
});
exports.login = login;
const finishLogin = (address) => {
    if (!checkInjected()) {
        return;
    }
    window.wally.finishLogin(address);
};
exports.finishLogin = finishLogin;
//# sourceMappingURL=index.js.map