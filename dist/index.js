"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProvider = exports.handleRedirect = exports.init = void 0;
const wally_connector_1 = __importDefault(require("./wally-connector"));
const init = (options) => {
    if (typeof window === 'undefined') {
        console.error('Ensure init() is called on the client only.');
        return;
    }
    window.wally = window.wally || new wally_connector_1.default(options);
};
exports.init = init;
const handleRedirect = (options) => {
    if (!window.wally) {
        console.error('Couldn\'t find wally instance. Ensure init() method is called first.');
        return;
    }
    window.wally.handleRedirect(options);
};
exports.handleRedirect = handleRedirect;
const getProvider = () => {
    if (!window.wally) {
        console.error('Couldn\'t find wally instance. Ensure init() method is called first.');
        return null;
    }
    return window.wally;
};
exports.getProvider = getProvider;
//# sourceMappingURL=index.js.map