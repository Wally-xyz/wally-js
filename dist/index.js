"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WallyConnector = void 0;
const react_1 = __importDefault(require("react"));
const client_1 = __importDefault(require("react-dom/client"));
const Login_1 = require("./components/Login");
const request_1 = require("./components/request");
class WallyConnector {
    constructor({ appId, authToken }) {
        this.appId = undefined;
        this.authToken = undefined;
        this.setAuthToken = (authToken) => {
            this.authToken = authToken;
        };
        this.appId = appId;
        this.authToken = authToken;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async requestGet(url) {
        return (0, request_1.request)(this.authToken, "GET", url, undefined);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async requestPost(url, data) {
        return (0, request_1.request)(this.authToken, "GET", url, data);
    }
    async getOTP(email) {
        return this.requestPost("users/login", { email });
    }
    async verifyOTP(email, otp) {
        const result = this.requestPost("users/verifyOTP", {
            email,
            otp,
        });
        if (result.token) {
            this.authToken = result.token;
        }
        return result;
    }
    async getWallets() {
        return this.requestGet("wallets");
    }
    authorise() {
        this.authToken = undefined;
        const anchor = document.createElement("div");
        document.body.appendChild(anchor);
        this.root = client_1.default.createRoot(anchor);
        this.root.render(react_1.default.createElement(Login_1.LoginComponent, { setAuthToken: (tkn) => {
                var _a;
                this.setAuthToken(tkn);
                (_a = this.root) === null || _a === void 0 ? void 0 : _a.unmount();
            } }));
    }
}
exports.WallyConnector = WallyConnector;
//# sourceMappingURL=index.js.map