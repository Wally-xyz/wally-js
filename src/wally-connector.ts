import {
  WallyConnectorOptions,
  RedirectOptions,
  RequestObj,
  MethodName,
  SignedMessage,
} from './types';

import {
  APP_ROOT,
  getRedirectPage,
  getScrimElement,
} from './constants';

class WallyConnector {
  private clientId: string | null;
  private host: string | null;
  private isDevelopment: boolean;
  public selectedAddress: string | null;
  private didHandleRedirect: boolean;

  constructor({
    clientId,
    isDevelopment,
    devUrl,
  }: WallyConnectorOptions) {
    this.clientId = clientId;
    this.host = isDevelopment && devUrl || APP_ROOT;
    this.selectedAddress = null;
    this.isDevelopment = !!isDevelopment;
    this.didHandleRedirect = false;
  }

  public async loginWithEmail(): Promise<void> {
    if (!this.clientId) {
      return;
    }
    const state = this.generateStateCode();
    this.saveState(state);
    const queryParams = new URLSearchParams({ clientId: this.clientId, state });

    window.open(`${this.host}/oauth/otp?${queryParams.toString()}`, '_blank');

    const scrim = getScrimElement();
    document.body.appendChild(scrim);

    return new Promise((resolve) => {
      window.addEventListener('storage', () => {
        if (!this.getAuthToken()) {
          return;
        }
        resolve();
        document.body.removeChild(scrim);
      });
    });
  }

  public isRedirected(): boolean {
    return this.getState() !== null;
  }

  public isLoggedIn(): boolean {
    return !!this.getAuthToken();
  }

  public async handleRedirect({
    closeWindow = false,
    appendContent = false,
  }: RedirectOptions): Promise<void> {
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

    let resp: Response;
    try {
      resp = await fetch(`${this.host}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          authCode,
        }),
      });
      if (resp && resp?.ok && resp?.status < 300) {
        const data = await resp.json();
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
  }

  private setAuthToken(authToken: string): void {
    localStorage.setItem(`wally:${this.clientId}:token`, authToken);
  }

  private getAuthToken(): string | null {
    return localStorage.getItem(`wally:${this.clientId}:token`);
  }

  private generateStateCode(length = 10) {
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

  private saveState(state: string) {
    localStorage.setItem(`wally:${this.clientId}:state:token`, state);
  }

  private getState(): string | null {
    return localStorage.getItem(`wally:${this.clientId}:state:token`);
  }

  private deleteState() {
    localStorage.removeItem(`wally:${this.clientId}:state:token`);
  }

  async request(req: RequestObj): Promise<any> {
    if (!this.isLoggedIn()) {
      await this.loginWithEmail();
    }

    switch (req.method) {
      case 'eth_requestAccounts':
        return this.requestAccounts();
      // TODO: figure out which name to use
      case 'personal_sign':
      case 'eth_sign':
        return this.signMessage(req.params);
      case MethodName.eth_getBalance:
        return this._request(req.method, req.params);
    }
  }

  async requestAccounts(): Promise<string[]> {
    let resp: Response;
    try {
      resp = await fetch(`${this.host}/oauth/me`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      });
      if (resp && resp?.ok && resp?.status < 300) {
        const data = await resp.json();
        this.selectedAddress = data.address;
        return [this.selectedAddress || ''];
      } else {
        console.error(
          'The Wally server returned a non-successful response when fetching wallet details'
        );
      }
    } catch (err) {
      console.error(`Unable to fetch Wally wallet: ${err}`);
    }
    return [];
  }

  async signMessage(params: string[]): Promise<SignedMessage | string> {
    const resp = await fetch(`${this.host}/oauth/wallet/sign-message`, {
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
    const json = await resp.json();
    return json.signature;
  }

  /**
   * Handle other non-wally-specific methods - forwards to ethers/alchemy
   * on the backend
   * @param method The RPC Method
   * @param params Arbitrary array of params
   * @returns whatever you want it to
   */
  private async _request(method: string, params: string[]): Promise<any> {
    const resp = await fetch(`${this.host}/oauth/wallet/send`, {
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
    const body = await resp.text();
    return body;
  }
}

export default WallyConnector;
