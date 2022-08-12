"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WallyConnector = void 0;
const constants_1 = require("./constants");
class WallyConnector {
    constructor(authToken) {
        this.authToken = undefined;
        this.authToken = authToken;
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
        return this.requestGet("/wallets");
    }
}
exports.WallyConnector = WallyConnector;
//# sourceMappingURL=index.js.map