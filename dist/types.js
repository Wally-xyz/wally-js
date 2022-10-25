"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerMessage = exports.MethodName = void 0;
var MethodName;
(function (MethodName) {
    MethodName["REQUEST_ACCOUNTS"] = "eth_requestAccounts";
    MethodName["PERSONAL_SIGN"] = "personal_sign";
    MethodName["SIGN"] = "eth_sign";
    MethodName["GET_BALANCE"] = "eth_getBalance";
})(MethodName = exports.MethodName || (exports.MethodName = {}));
var WorkerMessage;
(function (WorkerMessage) {
    WorkerMessage["LOGIN_SUCCESS"] = "login-success";
    WorkerMessage["LOGIN_FAILURE"] = "login-failure";
})(WorkerMessage = exports.WorkerMessage || (exports.WorkerMessage = {}));
//# sourceMappingURL=types.js.map