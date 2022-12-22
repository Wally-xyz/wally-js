import {
  EmitterMessage,
  MethodNameType,
  MethodResponse,
  RequestObj,
  WallyOptions,
} from './types';

import { APP_ROOT } from './constants';

import Messenger from './messenger';
import Auth from './auth';
import Requester from './requester';

class WallyJS {
  private auth: Auth;
  private messenger: Messenger;
  private requester: Requester;

  constructor({
    authToken,
    clientId,
    disableRedirectClose,
    redirectURL,
    sharedWorkerUrl,
    verbose,
    _devUrl,
    _disableSharedWorker,
    _isDevelopment,
    _onTokenFetched,
  }: WallyOptions) {
    const host = (_isDevelopment && _devUrl) || APP_ROOT;

    this.messenger = new Messenger({
      sharedWorkerUrl,
      _disableSharedWorker,
    });

    this.auth = new Auth({
      authToken,
      clientId,
      disableRedirectClose,
      redirectURL,
      _isDevelopment,
      _onTokenFetched,
      host,
      messenger: this.messenger,
    });

    this.requester = new Requester({
      clientId,
      verbose,
      host,
      auth: this.auth,
      messenger: this.messenger,
    });
  }

  public get selectedAddress() {
    return this.auth.selectedAddress;
  }

  public finishLogin(address: string): void {
    if (!this.auth.isLoggingIn) {
      return;
    }
    this.auth.isLoggingIn = false;
    this.messenger.emit(EmitterMessage.ACCOUNTS_CHANGED, address);
    this.messenger.emit(EmitterMessage.CONNECTED);
  }

  public on(name: string, cb: (a?: any) => void): void {
    this.messenger.addListener(name, cb);
  }

  public removeListener(name: string, fn: any): void {
    this.messenger.removeListener(name, fn);
  }

  public removeAllListeners(name: string): void {
    this.messenger.removeAllListeners(name);
  }

  public async login(email?: string): Promise<void> {
    return this.auth.login(email);
  }

  public logout(): void {
    this.auth.clearAuthToken();
  }

  public isRedirected(): boolean {
    return this.auth.isRedirected();
  }

  public isLoggedIn(): boolean {
    return !!this.auth.getToken();
  }

  public async handleRedirect(): Promise<void> {
    return this.auth.handleRedirect();
  }

  public async request<T extends MethodNameType>(
    req: RequestObj<T>
  ): Promise<MethodResponse<T> | null> {
    return this.requester.request(req);
  }

  /**
   * @deprecated use isLoggedIn()
   */
  public isConnected(): boolean {
    return this.isLoggedIn();
  }

  /**
   * @deprecated use on()
   */
  public addListener(name: string, cb: (a?: any) => void): void {
    this.on(name, cb);
  }

  /**
   * @deprecated - use request()
   */
  public async sendAsync(req: any) {
    return this.request(req);
  }

  /**
   * @deprecated - use request({ method: 'eth_requestAccounts' }) directly
   */
  public async enable() {
    return this.request({ method: 'eth_requestAccounts' });
  }
}

export default WallyJS;
