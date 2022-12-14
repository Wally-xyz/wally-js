import Messenger from './messenger';
import { AuthOptions, EmitterMessage, WorkerMessage } from './types';

export default class Auth {
  // Options
  private clientId: string;
  private disableRedirectClose: boolean;
  private isDevelopment: boolean;
  private onTokenFetched?: (address: string) => void;
  private redirectUrl?: string;

  // Config
  private host: string;
  private messenger: Messenger;

  // State
  public isLoggingIn: boolean;
  public selectedAddress: string;
  private didHandleRedirect = false;

  constructor({
    authToken,
    clientId,
    disableRedirectClose,
    host,
    messenger,
    redirectURL,
    _isDevelopment,
    _onTokenFetched,
  }: AuthOptions) {
    this.clientId = clientId;
    this.disableRedirectClose = !!disableRedirectClose;
    this.isDevelopment = !!_isDevelopment;
    this.onTokenFetched = _onTokenFetched;
    this.redirectUrl = redirectURL;

    this.host = host;
    this.messenger = messenger;

    this.isLoggingIn = false;
    this.selectedAddress = '';

    if (authToken) {
      this.setAuthToken(authToken);
    }
  }

  public async login(email?: string): Promise<void> {
    if (this.isLoggingIn) {
      return Promise.reject('Already logging in.');
    }
    this.isLoggingIn = true;

    if (!this.clientId) {
      console.error('Please set a client ID');
      return;
    }
    const state = this.generateStateCode();
    this.saveState(state);
    const redirectUrl = this.redirectUrl || null;
    const queryParams = new URLSearchParams({
      clientId: this.clientId,
      state,
      ...((redirectUrl && { redirectUrl }) || {}),
      ...((email && { email }) || {}),
    });

    window.open(`${this.host}/oauth/otp?${queryParams.toString()}`, '_blank');

    return new Promise((resolve, reject) => {
      const listener = () => {
        this.messenger.removeListener(
          EmitterMessage.ACCOUNTS_CHANGED,
          listener
        );
        resolve();
      };
      this.messenger.addListener(EmitterMessage.ACCOUNTS_CHANGED, listener);

      const logFailure = () => {
        console.error(
          'Error logging in to Wally. ☹️\nPlease refresh and try again.'
        );
      };

      this.messenger.onWorkerMessage(WorkerMessage.LOGIN_SUCCESS, () => {
        // TODO: This needs to use the emitter. Will fix after restructuring/splitting up.
        if (!this.getToken()) {
          logFailure();
          reject();
          return;
        }
        resolve();
      });
      this.messenger.onWorkerMessage(WorkerMessage.LOGIN_FAILURE, () => {
        logFailure();
        reject();
      });
    });
  }

  public isRedirected(): boolean {
    return this.getState() !== null;
  }

  public async handleRedirect(): Promise<void> {
    if (this.didHandleRedirect) {
      return;
    }
    this.didHandleRedirect = true;

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
    let error = null;

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
        this.selectedAddress = data.wallet;
        this.onTokenFetched && this.onTokenFetched(data.wallet);
      } else {
        error = await resp.text();
        console.error(
          'The Wally server returned a non-successful response when exchanging authorization code for token'
        );
      }
    } catch (err) {
      error = err;
      console.error(`Unable to fetch Wally access token: ${err}`);
    }

    if (error) {
      this.deleteState();
      this.messenger.sendWorkerMessage(WorkerMessage.LOGIN_FAILURE);
      return;
    }

    this.messenger.sendWorkerMessage(WorkerMessage.LOGIN_SUCCESS);

    if (!this.disableRedirectClose) {
      window.setTimeout(window.close, 1000);
    }
  }

  private setAuthToken(authToken: string): void {
    localStorage.setItem(`wally:${this.clientId}:token`, authToken);
  }

  public getToken(): string | null {
    return localStorage.getItem(`wally:${this.clientId}:token`);
  }

  public clearAuthToken() {
    localStorage.removeItem(`wally:${this.clientId}:token`);
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
}
