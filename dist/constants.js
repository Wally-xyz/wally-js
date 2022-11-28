"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WALLY_ROUTES = exports.REDIRECT_CAPTION_ID = exports.APP_ROOT = void 0;
const types_1 = require("./types");
exports.APP_ROOT = 'https://api.wally.xyz/v1';
exports.REDIRECT_CAPTION_ID = 'wally-redirect-caption';
// TODO: Figure out the difference between sign & personal sign.
// There might be some prefixing deal in the spec, but right now
// both of them do. Will probably come back once we test this out
// in some real dApps.
exports.WALLY_ROUTES = {
    [types_1.WallyMethodName.ACCOUNTS]: 'me',
    [types_1.WallyMethodName.REQUEST_ACCOUNTS]: 'me',
    [types_1.WallyMethodName.SIGN]: 'wallet/sign-message',
    [types_1.WallyMethodName.PERSONAL_SIGN]: 'wallet/sign-message',
    [types_1.WallyMethodName.SIGN_TYPED]: 'wallet/sign-typed-data',
    [types_1.WallyMethodName.SIGN_TYPED_V4]: 'wallet/sign-typed-data',
    [types_1.WallyMethodName.SIGN_TRANSACTION]: 'wallet/sign-transaction',
    [types_1.WallyMethodName.SEND_TRANSACTION]: 'wallet/send-transaction',
};
//# sourceMappingURL=constants.js.map