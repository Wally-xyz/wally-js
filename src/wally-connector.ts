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
  WallyConnectorOptions,
  WallyMethodName,
  WallyMethodParams,
  WallyResponse,
  WorkerMessage,
} from './types';

import {
  APP_ROOT,
  REDIRECT_CAPTION_ID,
  SCRIM_TEXT_ID,
  getRedirectPage,
  getScrimElement,
  WALLY_ROUTES,
} from './constants';

class WallyConnector {
  private clientId: string | null;
  private host: string | null;
  private isDevelopment: boolean;
  public selectedAddress: string | null;
  private didHandleRedirect: boolean;
  private worker: SharedWorker | null;
  private workerCallbacks: Partial<Record<WorkerMessage, Array<() => void>>>;

  constructor({ clientId, isDevelopment, devUrl }: WallyConnectorOptions) {
    this.clientId = clientId;
    this.host = (isDevelopment && devUrl) || APP_ROOT;
    this.selectedAddress = null;
    this.isDevelopment = !!isDevelopment;
    this.didHandleRedirect = false;

    // todo - make path configurable, node_modules maybe?
    this.worker = SharedWorker ? new SharedWorker('/sdk/worker.js') : null;
    this.connectToSharedWorker();
    this.workerCallbacks = {};
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
      console.log({ resp });
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
    if (!this.isLoggedIn()) {
      await this.loginWithEmail();
    }

    if (Object.values(WallyMethodName).indexOf(req.method as any) > -1) {
      return this.requestWally(
        req.method as WallyMethodName,
        'params' in req ? (req.params as WallyMethodParams<T>) : undefined
      ) as Promise<WallyResponse<T>>;
    } else if (Object.values(RPCMethodName).indexOf(req.method as any) > -1) {
      return this.requestRPC(
        req.method as RPCMethodName,
        'params' in req ? (req.params as RPCMethodParams<T>) : undefined
      );
    } else {
      throw new Error(`Method ${req.method} is unsupported at this time.`);
    }
  }

  private formatWallyParams<T extends WallyMethodName>(
    method: T,
    params: WallyMethodParams<T>
  ): string {
    if (method === WallyMethodName.SIGN) {
      return JSON.stringify({ message: (params as SignParams)[1] });
    } else if (method === WallyMethodName.PERSONAL_SIGN) {
      return JSON.stringify({ message: (params as PersonalSignParams)[0] });
    } else {
      return JSON.stringify(params);
    }
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
      case WallyMethodName.SIGN_TYPED: {
        const { signature } = data;
        return signature;
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
          ...(method.indexOf('sign') > -1
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
    console.log({ method, params });
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
        throw new Error(
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
