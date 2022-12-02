import {
  EmitterMessage,
  MethodNameType,
  MethodResponse,
  PersonalSignParams,
  RequestObj,
  RPCMethodName,
  RPCMethodParams,
  RPCResponse,
  SignParams,
  SignTypedParams,
  WallyConnectorOptions,
  WallyMethodName,
  WallyMethodParams,
  WallyResponse,
  WorkerMessage,
  WTransactionRequest,
} from './types';

import { APP_ROOT, REDIRECT_CAPTION_ID, WALLY_ROUTES } from './constants';

class WallyConnector {
  // Public
  public selectedAddress: string | null = null;

  // Options
  private clientId: string | null;
  private disableRedirectClose = false;
  private host: string | null;
  private isDevelopment: boolean;
  private disableLoginOnRequest?: boolean;
  private redirectUrl: string | undefined;
  private verbose: boolean;
  private onTokenFetched?: (address: string) => void;

  // Internal State
  private didHandleRedirect = false;
  private emitterCallbacks: Partial<Record<string, Array<(a?: any) => void>>> =
    {};
  private isLoggingIn = false;
  private worker: SharedWorker | null = null;
  private workerCallbacks: Partial<Record<WorkerMessage, Array<() => void>>> =
    {};

  constructor({
    clientId,
    disableRedirectClose,
    disableLoginOnRequest,
    redirectURL,
    verbose,
    sharedWorkerUrl,
    _devUrl,
    _disableSharedWorker,
    _isDevelopment,
    _onTokenFetched,
  }: WallyConnectorOptions) {
    this.clientId = clientId;
    this.disableRedirectClose = !!disableRedirectClose;
    this.host = (_isDevelopment && _devUrl) || APP_ROOT;
    this.isDevelopment = !!_isDevelopment;
    this.disableLoginOnRequest = disableLoginOnRequest;
    this.onTokenFetched = _onTokenFetched;
    this.redirectUrl = redirectURL;
    this.verbose = !!verbose;

    if (!_disableSharedWorker && sharedWorkerUrl && SharedWorker) {
      this.worker = new SharedWorker(sharedWorkerUrl);
      this.connectToSharedWorker();
    }
  }

  public finishLogin = (address: string): void => {
    if (!this.isLoggingIn) {
      return;
    }
    this.isLoggingIn = false;
    this.emit(EmitterMessage.ACCOUNTS_CHANGED, address);
    this.emit(EmitterMessage.CONNECTED);
  };

  public on(name: string, cb: (a?: any) => void): void {
    if (!this.emitterCallbacks[name]) {
      this.emitterCallbacks[name] = [];
    }
    this.emitterCallbacks[name]?.push(cb);
  }

  public addListener(name: string, cb: (a?: any) => void): void {
    this.on(name, cb);
  }

  public removeListener(name: string, fn: any): void {
    const idx = this.emitterCallbacks[name]?.indexOf(fn);
    if (idx && idx > -1) {
      this.emitterCallbacks[name]?.splice(idx, 1);
    }
  }

  public removeAllListeners(name: string) {
    this.emitterCallbacks[name] = [];
  }

  /**
   * The function used to call all listeners for a specific messsage.
   * Does NOT remove them, should be removed with a separate `removeListener()`
   * or `removeAllListeners` call. There isn't really a well-defined list of
   * messages to handle, so this is open-ended on purpose.
   * `accountsChanged` is really the big important one used throughout public apps.
   * @param message The name of the message we're emitting
   * @param address [optional] The current wallet address,
   * only used when handling accountsChanged messages.
   */
  private emit(message: string, address?: string): void {
    if (message === EmitterMessage.ACCOUNTS_CHANGED && !address) {
      throw new Error(
        'address not provided for emmitting `accountsChanged` message'
      );
      return;
    }

    this.emitterCallbacks[message]?.forEach((cb) => {
      cb(message === EmitterMessage.ACCOUNTS_CHANGED ? [address] : undefined);
    });
  }

  private connectToSharedWorker(): void {
    if (!this.worker) {
      console.error(
        'SharedWorker not available, falling back to less-than-ideal experience.'
      );
      return;
    }

    this.worker.port.start();
    this.worker.port.onmessage = (e: MessageEvent) => {
      this.handleWorkerMessage(e.data);
    };
  }

  private handleWorkerMessage(message: WorkerMessage): void {
    if (!this.worker) {
      return;
    }
    this.workerCallbacks[message]?.forEach((cb) => cb());
  }

  private onWorkerMessage(message: WorkerMessage, fn: () => void) {
    if (!this.worker) {
      return;
    }
    if (!this.workerCallbacks[message]) {
      this.workerCallbacks[message] = [];
    }
    this.workerCallbacks[message]?.push(fn);
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
        this.removeListener(EmitterMessage.ACCOUNTS_CHANGED, listener);
        resolve();
      };
      this.on(EmitterMessage.ACCOUNTS_CHANGED, listener);

      const logFailure = () => {
        console.error(
          'Error logging in to Wally. ☹️\nPlease refresh and try again.'
        );
      };

      this.onWorkerMessage(WorkerMessage.LOGIN_SUCCESS, () => {
        // TODO: This needs to use the emitter. Will fix after restructuring/splitting up.
        if (!this.getAuthToken()) {
          logFailure();
          reject();
          return;
        }
        resolve();
      });
      this.onWorkerMessage(WorkerMessage.LOGIN_FAILURE, () => {
        logFailure();
        reject();
      });
    });
  }

  public isRedirected(): boolean {
    return this.getState() !== null;
  }

  public isLoggedIn(): boolean {
    return !!this.getAuthToken();
  }

  public isConnected(): boolean {
    return this.isLoggedIn();
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
    const caption = document.getElementById(REDIRECT_CAPTION_ID);

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
      this.worker
        ? this.worker.port.postMessage(WorkerMessage.LOGIN_FAILURE)
        : {};

      if (caption) {
        caption.innerText = `Error retreiving token.\n${error.toString()}`;
        caption.style.color = 'red';
      }
      return;
    }

    if (this.worker) {
      this.worker.port.postMessage(WorkerMessage.LOGIN_SUCCESS);
    }

    caption
      ? (caption.innerText =
          'Success. You may now close this page and refresh the app.')
      : {};

    if (!this.disableRedirectClose) {
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

  private isWallyMethod(name: MethodNameType): name is WallyMethodName {
    return Object.values(WallyMethodName).indexOf(name as any) > -1;
  }

  private isRPCMethod(name: MethodNameType): name is RPCMethodName {
    return Object.values(RPCMethodName).indexOf(name as any) > -1;
  }

  /**
   * @deprecated - see this.request()
   */
  public async sendAsync(req: any) {
    return this.request(req);
  }

  /**
   * @deprecated - is deprecated and may be removed in the future. Please use the 'eth_requestAccounts' RPC method
   * instead. For more information, see: https://eips.ethereum.org/EIPS/eip-1102
   */
  public async enable() {
    return this.request({ method: 'eth_requestAccounts' });
  }

  /**
   * This is the major exposed method for supporting JSON RPC methods
   * and associated wallet/blockchain functionality.
   * There are two main types of requests: those that require wallet info
   * (address, signing), and those that do not (gas prices, last block).
   * We route the former to customized endpoints on the backend that handle
   * this extra wallet fetching and logic, and the latter to an endpoint
   * that essentially works as a passthrough to ethers/alchemy.
   *
   * TODO: Move requesting logic and helpers to separate file/module
   * @param req
   * @param req.method - the name of the RPC method
   * @param req.params - the required parameters for the method
   * @returns Promise<MethodResponse> | null
   * @see https://ethereum.org/en/developers/docs/apis/json-rpc/#json-rpc-methods
   */
  async request<T extends MethodNameType>(
    req: RequestObj<T>
  ): Promise<MethodResponse<T> | null> {
    if (this.verbose) {
      console.log(
        `wally requesting: ${req.method} w/ params: ${
          (req as any).params || 'none'
        }`
      );
    }

    if (!this.isLoggedIn()) {
      // bandaid for courtyard, etc.
      // (eth_accounts might just be for checking loggedin status)
      if (req.method === WallyMethodName.ACCOUNTS) {
        return Promise.resolve([] as any);
      }
      return this.deferredRequest(req);
    }

    let res;
    if (this.isWallyMethod(req.method)) {
      res = this.requestWally(
        req.method as WallyMethodName,
        'params' in req ? (req.params as WallyMethodParams<T>) : undefined
      ) as Promise<WallyResponse<T>>;
    } else if (this.isRPCMethod(req.method)) {
      res = this.requestRPC(
        req.method as RPCMethodName,
        'params' in req ? (req.params as RPCMethodParams<T>) : undefined
      );
    } else {
      console.warn(
        `Method: ${req.method} is not officially supported by wally at this time, use at your own risk! Contact the wally team to get it prioritized.`
      );
      res = this.requestRPC(
        req.method as any,
        'params' in req ? (req.params as any) : undefined
      );
    }

    if (this.verbose) {
      console.log('wally response:', { res });
    }
    return res;
  }

  /**
   * The promise for handling when trying to make a request before the user has
   * logged in. Either:
   * - trigger a login once (web3 standard), and trigger the request after the
   *   login is complete (adding requests in the meantime to the emitter queue) OR
   * - just add all requests to the emitter queue, waiting for the consumer to manually login.
   * TODO: explore converting to async/await with callbacks to prevent indefinite blocking while
   * waiting for a message that may potentially never come.
   * @param req RequestObj
   * @returns Promise
   */
  private deferredRequest<T extends MethodNameType>(
    req: RequestObj<T>
  ): Promise<MethodResponse<T> | null> {
    return new Promise((resolve, reject) => {
      if (!this.disableLoginOnRequest && !this.isLoggingIn) {
        this.login().then(() => {
          resolve(this.request(req));
        });
      } else {
        const listener = () => {
          this.removeListener(EmitterMessage.ACCOUNTS_CHANGED, listener);
          resolve(this.request(req));
        };
        this.on(EmitterMessage.ACCOUNTS_CHANGED, listener);
      }
    });
  }

  private formatWallyParams<T extends WallyMethodName>(
    method: T,
    params: WallyMethodParams<T>
  ): string {
    switch (method) {
      case WallyMethodName.SIGN:
        return JSON.stringify({ message: (params as SignParams)[1] });
      case WallyMethodName.PERSONAL_SIGN:
        return JSON.stringify({ message: (params as PersonalSignParams)[0] });
      case WallyMethodName.SIGN_TYPED:
      case WallyMethodName.SIGN_TYPED_V4: {
        // NOTE: Requests from opensea are already a json string
        const data = (params as SignTypedParams)[1];
        if (typeof data === 'string') {
          return data;
        } else return JSON.stringify(data);
      }
      case WallyMethodName.SEND_TRANSACTION:
      case WallyMethodName.SIGN_TRANSACTION: {
        const { gas, gasLimit, ...txn } = (params as WTransactionRequest[])[0];
        return JSON.stringify({
          ...txn,
          gasLimit: gasLimit || gas,
        });
      }
      default:
        return JSON.stringify(params);
    }
  }

  private isJSONContentType(method: WallyMethodName): boolean {
    return (
      [
        WallyMethodName.SIGN,
        WallyMethodName.PERSONAL_SIGN,
        WallyMethodName.SIGN_TYPED,
        WallyMethodName.SIGN_TYPED_V4,
        WallyMethodName.SIGN_TRANSACTION,
        WallyMethodName.SEND_TRANSACTION,
      ].indexOf(method) > -1
    );
  }

  private formatWallyResponse<T extends WallyMethodName>(
    method: T,
    data: any
  ): WallyResponse<T> | null {
    switch (method) {
      case WallyMethodName.ACCOUNTS:
      case WallyMethodName.REQUEST_ACCOUNTS: {
        const { address } = data;
        this.selectedAddress = address;
        return [address] as WallyResponse<T>;
      }
      case WallyMethodName.SIGN:
      case WallyMethodName.PERSONAL_SIGN:
      case WallyMethodName.SIGN_TRANSACTION:
      case WallyMethodName.SIGN_TYPED:
      case WallyMethodName.SIGN_TYPED_V4: {
        const { signature } = data;
        return signature;
      }
      case WallyMethodName.SEND_TRANSACTION: {
        const { hash } = data;
        return hash;
      }
    }
    return null;
  }

  /**
   * Method used doing wallet-related actions like requesting accounts
   * and signing things - actions that require wallet/private key access
   * and are basically the core wally value prop.
   * @param method The RPC method name associated with the wally api call
   * @param params The json rpc spec params (*not* wally's spec)
   * @returns WallyResponse - adheres to the json rpc spec
   */
  private async requestWally<T extends WallyMethodName>(
    method: T,
    params: WallyMethodParams<T>
  ): Promise<WallyResponse<T> | null> {
    let resp: Response;
    try {
      resp = await fetch(`${this.host}/oauth/${WALLY_ROUTES[method]}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          ...(this.isJSONContentType(method)
            ? { 'Content-Type': 'application/json' }
            : {}),
        },
        ...(params &&
          params.length > 0 && {
            body: this.formatWallyParams(method, params),
          }),
      });
      if (resp && resp?.ok && resp?.status < 300) {
        const data = await resp.json();
        return this.formatWallyResponse(method, data);
      } else {
        console.error(
          `The Wally server returned a non-successful response when handling method: ${method}`
        );
      }
    } catch (err) {
      console.error(
        `Wally server returned error: ${err} when handling method: ${method}`
      );
    }

    return Promise.reject(new Error(`Invalid response for ${method}`));
  }

  /**
   * Handle other non-wally-specific methods - forwards to ethers/alchemy
   * on the backend
   * @param method The RPC method name
   * @param params The json rpc spec params
   * @returns RPCResponse - adheres to the json rpc spec
   */
  private async requestRPC<T extends RPCMethodName>(
    method: T,
    params: RPCMethodParams<T>
  ): Promise<RPCResponse<T> | null> {
    try {
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
        console.error(
          `Wally server returned a non-successful response when handling method: ${method}`
        );
      }

      const contentType = resp.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        const json = await resp.json();
        return json;
      } else {
        const text = await resp.text();
        return text as RPCResponse<T>;
      }
    } catch (err) {
      console.error(
        `Wally server returned error: ${err} when handling method: ${method}`
      );
    }
    return Promise.reject(new Error(`Invalid response for ${method}`));
  }
}

export default WallyConnector;
