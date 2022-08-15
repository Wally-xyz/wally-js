"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WallyConnector = void 0;
const react_1 = __importDefault(require("react"));
const client_1 = __importDefault(require("react-dom/client"));
const Login_1 = require("./widgets/Login");
const constants_1 = require("./constants");
class WallyConnector {
    constructor(authToken) {
        this.authToken = undefined;
        this.setAuthToken = (authToken) => {
            var _a;
            this.authToken = authToken;
            (_a = this.root) === null || _a === void 0 ? void 0 : _a.unmount();
        };
        if (authToken) {
            this.authToken = authToken;
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async requestGet(url) {
        if (!this.authToken) {
            console.error("--- UNAUTHORISED ---");
        }
        const response = await fetch(`${constants_1.APP_ROOT}${url}`, {
            headers: {
                Authorization: `Bearer ${this.authToken}`,
            },
        });
        return response.json();
    }
    async getWallets() {
        return this.requestGet("wallets");
    }
    authorise() {
        this.authToken = undefined;
        const anchor = document.createElement("div");
        document.body.appendChild(anchor);
        this.root = client_1.default.createRoot(anchor);
        this.root.render(react_1.default.createElement(Login_1.LoginComponent, { setAuthToken: this.setAuthToken }));
    }
}
exports.WallyConnector = WallyConnector;
//# sourceMappingURL=index.js.map