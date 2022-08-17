"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = void 0;
const constants_1 = require("./constants");
const request = async (authToken, method, url, data, isAuthenticated = true
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) => {
    if (!authToken && isAuthenticated) {
        console.error("--- UNAUTHORISED ACCESS ---");
        return;
    }
    const requestObject = {
        method,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    };
    if (isAuthenticated) {
        requestObject.headers.Authorization = `Bearer ${authToken}`;
    }
    if (method === "POST" && data) {
        requestObject.body = JSON.stringify(data);
    }
    const response = await fetch(`${constants_1.APP_ROOT}${url}`, requestObject);
    return response.json();
};
exports.request = request;
//# sourceMappingURL=request.js.map