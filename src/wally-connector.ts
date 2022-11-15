import {
  MethodNameType,
  MethodResponse,
  PersonalSignParams,
  RedirectOptions,
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

import {
  APP_ROOT,
  REDIRECT_CAPTION_ID,
  SCRIM_TEXT_ID,
  getRedirectPage,
  getScrimElement,
  WALLY_ROUTES,
} from './constants';
// import { TransactionRequest } from '@ethersproject/providers';

class WallyConnector {
  private clientId: string | null;
  private host: string | null;
  private isDevelopment: boolean;
  public selectedAddress: string | null;
  private didHandleRedirect: boolean;
  private worker: SharedWorker | null;
  private workerCallbacks: Partial<Record<WorkerMessage, Array<() => void>>>;
  private verbose: boolean;

  constructor({
    clientId,
    isDevelopment,
    devUrl,
    token,
    verbose,
  }: WallyConnectorOptions) {
    this.clientId = clientId;
    this.host = (isDevelopment && devUrl) || APP_ROOT;
    this.selectedAddress = null;
    this.isDevelopment = !!isDevelopment;
    this.didHandleRedirect = false;
    this.verbose = !!verbose;

    // todo - make path configurable, node_modules maybe?
    this.worker = SharedWorker ? new SharedWorker('/sdk/worker.js') : null;
    this.connectToSharedWorker();
    this.workerCallbacks = {};

    if (token) {
      if (!isDevelopment) {
        console.error('Token may only be used in development mode.');
      } else {
        if (verbose) {
          console.log('Setting auth token');
        }
        this.setAuthToken(token);
      }
    }
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

  public async loginWithEmail(): Promise<void> {
    if (!this.clientId) {
      console.error('Please set a client ID');
      return;
    }
    const state = this.generateStateCode();
    this.saveState(state);
    const queryParams = new URLSearchParams({ clientId: this.clientId, state });

    window.open(`${this.host}/oauth/otp?${queryParams.toString()}`, '_blank');

    const scrim = getScrimElement();
    document.body.appendChild(scrim);

    return new Promise((resolve, reject) => {
      const updateFailureScrim = () => {
        const scrimText = document.getElementById(SCRIM_TEXT_ID);
        scrimText
          ? (scrimText.innerText =
              'Error logging in. ☹️\nPlease refresh and try again.')
          : {};
      };

      this.onWorkerMessage(WorkerMessage.LOGIN_SUCCESS, () => {
        if (!this.getAuthToken()) {
          updateFailureScrim();
          reject();
          return;
        }
        resolve();
        document.body.removeChild(scrim);
      });
      this.onWorkerMessage(WorkerMessage.LOGIN_FAILURE, () => {
        updateFailureScrim();
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

  private isWallyMethod(name: MethodNameType): name is WallyMethodName {
    return Object.values(WallyMethodName).indexOf(name as any) > -1;
  }

  private isRPCMethod(name: MethodNameType): name is RPCMethodName {
    return Object.values(RPCMethodName).indexOf(name as any) > -1;
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
      await this.loginWithEmail();
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

    return null;
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
    return null;
  }
}

export default WallyConnector;
