var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class WallyConnector {
    constructor(clientId, opts) {
        this.clientId = clientId;
        this.opts = opts;
    }
    loginWithEmail() {
        var _a;
        const queryParams = new URLSearchParams({ clientId: this.clientId, state: this.generateStateCode() });
        window.location.replace(((_a = this.opts) === null || _a === void 0 ? void 0 : _a.test)
            ? `https://api.wally.xyz/oauth/otp?${queryParams.toString()}`
            : `http://localhost:3000/oauth/otp?${queryParams.toString()}`);
    }
    setAuthToken(authToken) {
        localStorage.setItem(`wally:${this.clientId}`, authToken);
    }
    ;
    getAuthToken() {
        return localStorage.getItem(`wally:${this.clientId}`);
    }
    generateStateCode(length = 10) {
        const chars = [];
        for (let i = 0; i < 26; i++) {
            chars.push(String.fromCharCode('a'.charCodeAt(0) + i));
            chars.push(String.fromCharCode('A'.charCodeAt(0) + i));
        }
        for (let i = 0; i < 10; i++) {
            chars.push('0'.charCodeAt(0) + i);
        }
        const authCode = [];
        for (let charCount = 0; charCount < length; charCount++) {
            const randInt = Math.floor(Math.random() * chars.length);
            authCode.push(chars[randInt]);
        }
        return authCode.join('');
    }
    signMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryString = new URLSearchParams({ message }).toString();
            const resp = yield fetch(`/app/user/sign-message?${queryString}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${this.getAuthToken()}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            });
            if (!resp.ok || resp.status >= 300) {
                throw new Error('Server returned a non-successful response');
            }
            return yield resp.json();
        });
    }
}
//# sourceMappingURL=index.js.map