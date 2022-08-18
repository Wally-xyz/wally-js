"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WallyConnector = void 0;
const request_1 = require("./request");
class WallyConnector {
    constructor({ appId, authToken, } = {}) {
        this.appId = undefined;
        this.authToken = undefined;
        this.setAuthToken = (authToken) => {
            this.authToken = authToken;
        };
        // TODO: is appId required field
        this.appId = appId;
        this.authToken = authToken;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async requestGet(url, isAuthenticated) {
        return (0, request_1.request)(this.authToken, "GET", url, undefined, isAuthenticated);
    }
    async requestPost(url, data, isAuthenticated
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) {
        return (0, request_1.request)(this.authToken, "POST", url, data, isAuthenticated);
    }
    async getOTP(email) {
        return this.requestPost("users/login", { email }, false);
    }
    async verifyOTP(email, OTP) {
        const result = this.requestPost("users/verifyOTP", {
            email,
            OTP,
        }, false);
        if (result.token) {
            this.authToken = result.token;
        }
        return result;
    }
    async signMessage(message) {
        return this.requestPost("users/sign-message", { message, appId: this.appId }, false);
    }
    async getWallets() {
        return this.requestGet("users/wallets");
    }
}
exports.WallyConnector = WallyConnector;
//# sourceMappingURL=index.js.map