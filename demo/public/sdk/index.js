'use strict';
/**
 * TODO: Everything is in a single file for the moment so that typescript
 * builds a single script file that can access the global window scope.
 * Otherwise, it builds a module that needs importing.
 *
 * I'll figure out how to clean this up later if it's the direction we
 * decide to go.
 */
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var MethodName;
(function (MethodName) {
  MethodName['eth_requestAccounts'] = 'eth_requestAccounts';
  MethodName['personal_sign'] = 'personal_sign';
  MethodName['eth_getBalance'] = 'eth_getBalance';
})(MethodName || (MethodName = {}));
/**
 * ------ CONSTANTS --------
 */
const APP_ROOT = 'https://api.wally.xyz/';
const getScrimElement = () => {
  const scrim = document.createElement('div');
  scrim.style.position = 'absolute';
  scrim.style.top = '0';
  scrim.style.left = '0';
  scrim.style.width = '100%';
  scrim.style.height = '100%';
  scrim.style.background = '#9995';
  const text = document.createElement('div');
  text.innerText = 'Logging in to Wally...';
  text.style.position = 'absolute';
  text.style.width = '256px';
  text.style.height = '128px';
  text.style.background = '#CCC';
  text.style.color = '#222';
  text.style.fontWeight = 'bold';
  text.style.textAlign = 'center';
  text.style.paddingTop = '48px';
  text.style.margin = 'auto';
  text.style.top = '0';
  text.style.left = '0';
  text.style.right = '0';
  text.style.bottom = '0';
  text.style.borderRadius = '5px';
  text.style.boxShadow = '0px 3px 24px 3px #222c';
  scrim.appendChild(text);
  return scrim;
};
const getRedirectPage = () => {
  const containerEl = document.createElement('div');
  containerEl.style.position = 'absolute';
  containerEl.style.top = '50%';
  containerEl.style.left = '50%';
  containerEl.style.transform = 'translate(-50%, -50%)';
  containerEl.style.textAlign = 'center';
  const el = document.createElement('h1');
  el.innerText = 'Logged In To Wally!';
  const img = document.createElement('img');
  img.src = '/logo.gif';
  img.width = 150;
  const caption = document.createElement('p');
  caption.innerText = 'Redirecting...';
  caption.style.fontStyle = 'italic';
  containerEl.appendChild(el);
  containerEl.appendChild(img);
  containerEl.appendChild(caption);
  return containerEl;
};
/**
 * ------ MAIN --------
 */
class WallyConnector {
  constructor() {
    this.clientId = null;
    this.host = null;
    this.selectedAddress = null;
    this.isDevelopment = false;
    this.didHandleRedirect = false;
  }
  init({ clientId, isDevelopment = false, devUrl = '' }) {
    this.clientId = clientId;
    this.isDevelopment = isDevelopment;
    this.host = isDevelopment ? devUrl : APP_ROOT;
  }
  loginWithEmail() {
    return __awaiter(this, void 0, void 0, function* () {
      if (!this.clientId) {
        return;
      }
      const state = this.generateStateCode();
      this.saveState(state);
      const queryParams = new URLSearchParams({
        clientId: this.clientId,
        state,
      });
      window.open(`${this.host}/oauth/otp?${queryParams.toString()}`, '_blank');
      const scrim = getScrimElement();
      document.body.appendChild(scrim);
      return new Promise((resolve) => {
        window.addEventListener('storage', (e) => {
          if (!this.getAuthToken()) {
            return;
          }
          resolve();
          document.body.removeChild(scrim);
        });
      });
    });
  }
  isRedirected() {
    return this.getState() !== null;
  }
  isLoggedIn() {
    return !!this.getAuthToken();
  }
  handleRedirect({ closeWindow = false, appendContent = false }) {
    return __awaiter(this, void 0, void 0, function* () {
      if (this.didHandleRedirect) {
        return;
      }
      this.didHandleRedirect = true;
      if (appendContent) {
        document.body.appendChild(getRedirectPage());
      }
      const storedState = this.getState();
      const queryParams = new URLSearchParams(window.location.search);
      if (storedState && storedState !== queryParams.get('state')) {
        this.deleteState();
        if (this.isDevelopment) {
          console.error('Invalid Wally state');
        }
      }
      this.deleteState();
      const authCode = queryParams.get('authorization_code');
      let resp;
      try {
        resp = yield fetch(`${this.host}/oauth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            authCode,
          }),
        });
        if (
          resp &&
          (resp === null || resp === void 0 ? void 0 : resp.ok) &&
          (resp === null || resp === void 0 ? void 0 : resp.status) < 300
        ) {
          const data = yield resp.json();
          this.setAuthToken(data.token);
        } else {
          this.deleteState();
          console.error(
            'The Wally server returned a non-successful response when exchanging authorization code for token'
          );
        }
      } catch (err) {
        console.error(`Unable to fetch Wally access token: ${err}`);
        this.deleteState();
      }
      if (closeWindow) {
        window.setTimeout(window.close, 1000);
      }
    });
  }
  setAuthToken(authToken) {
    localStorage.setItem(`wally:${this.clientId}:token`, authToken);
  }
  getAuthToken() {
    return localStorage.getItem(`wally:${this.clientId}:token`);
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
  saveState(state) {
    localStorage.setItem(`wally:${this.clientId}:state:token`, state);
  }
  getState() {
    return localStorage.getItem(`wally:${this.clientId}:state:token`);
  }
  deleteState() {
    localStorage.removeItem(`wally:${this.clientId}:state:token`);
  }
  request(req) {
    return __awaiter(this, void 0, void 0, function* () {
      if (!this.isLoggedIn()) {
        yield this.loginWithEmail();
      }
      switch (req.method) {
        case 'eth_requestAccounts':
          return this.requestAccounts();
        case 'personal_sign':
          return this.signMessage(req.params);
        case MethodName.eth_getBalance:
          return this._request(req.method, req.params);
      }
    });
  }
  requestAccounts() {
    return __awaiter(this, void 0, void 0, function* () {
      let resp;
      try {
        resp = yield fetch(`${this.host}/oauth/me`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
        });
        if (
          resp &&
          (resp === null || resp === void 0 ? void 0 : resp.ok) &&
          (resp === null || resp === void 0 ? void 0 : resp.status) < 300
        ) {
          const data = yield resp.json();
          this.selectedAddress = data.address;
          return [this.selectedAddress];
        } else {
          console.error(
            'The Wally server returned a non-successful response when fetching wallet details'
          );
        }
      } catch (err) {
        console.error(`Unable to fetch Wally wallet: ${err}`);
      }
      return [];
    });
  }
  signMessage(params) {
    return __awaiter(this, void 0, void 0, function* () {
      const resp = yield fetch(`${this.host}/oauth/wallet/sign-message`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: params[1],
        }),
      });
      if (!resp.ok || resp.status >= 300) {
        throw new Error(
          'Wally server returned a non-successful response when signing a message'
        );
      }
      const json = yield resp.json();
      return json.signature;
    });
  }
  /**
   * Handle other non-wally-specific methods - forwards to ethers/alchemy
   * on the backend
   * @param method The RPC Method
   * @param params Arbitrary array of params
   * @returns whatever you want it to
   */
  _request(method, params) {
    return __awaiter(this, void 0, void 0, function* () {
      const resp = yield fetch(`${this.host}/oauth/wallet/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method,
          params,
        }),
      });
      if (!resp.ok || resp.status >= 300) {
        throw new Error(
          'Wally server returned a non-successful response when signing a message'
        );
      }
      const body = yield resp.text();
      return body;
    });
  }
}
// eslint-disable-next-line no-var
var wally = window.wally || new WallyConnector();
//# sourceMappingURL=index.js.map
