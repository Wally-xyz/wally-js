"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = void 0;
const constants_1 = require("../constants");
const request = async (authToken, method, url, data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) => {
    if (!authToken) {
        console.error("--- UNAUTHORISED ACCESS ---");
    }
    const response = await fetch(`${constants_1.APP_ROOT}${url}`, {
        method,
        headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
        },
        body: data ? JSON.stringify(data) : undefined,
    });
    return response.json();
};
exports.request = request;
//# sourceMappingURL=request.js.map