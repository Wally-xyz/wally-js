"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WALLY_ROUTES = exports.getRedirectPage = exports.SCRIM_TEXT_ID = exports.SCRIM_ID = exports.REDIRECT_CAPTION_ID = exports.APP_ROOT = void 0;
const types_1 = require("./types");
exports.APP_ROOT = 'https://api.wally.xyz/v1';
exports.REDIRECT_CAPTION_ID = 'wally-redirect-caption';
exports.SCRIM_ID = 'wally-scrim';
exports.SCRIM_TEXT_ID = 'wally-scrim-text';
const getRedirectPage = () => {
    const containerEl = document.createElement('div');
    containerEl.style.position = 'absolute';
    containerEl.style.top = '50%';
    containerEl.style.left = '50%';
    containerEl.style.transform = 'translate(-50%, -50%)';
    containerEl.style.textAlign = 'center';
    const el = document.createElement('h1');
    el.innerText = 'Logging In To Wally';
    const img = document.createElement('img');
    img.src = '/logo.gif';
    img.width = 150;
    const caption = document.createElement('p');
    caption.id = exports.REDIRECT_CAPTION_ID;
    caption.innerText = 'Fetching token...';
    caption.style.fontStyle = 'italic';
    containerEl.appendChild(el);
    containerEl.appendChild(img);
    containerEl.appendChild(caption);
    return containerEl;
};
exports.getRedirectPage = getRedirectPage;
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