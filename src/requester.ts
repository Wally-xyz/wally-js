import Auth from './auth';
import { WALLY_ROUTES } from './constants';
import Messenger from './messenger';
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
  WallyMethodName,
  WallyMethodParams,
  WallyResponse,
  WTransactionRequest,
  RequesterOptions,
} from './types';

export default class Requester {
  // Options
  private clientId: string;
  private verbose: boolean;

  // Config
  private host: string;

  // Services
  private messenger: Messenger;
  private auth: Auth;

  constructor({ clientId, verbose, host, auth, messenger }: RequesterOptions) {
    this.clientId = clientId;
    this.verbose = !!verbose;

    this.host = host;

    this.auth = auth;
    this.messenger = messenger;
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
  public async request<T extends MethodNameType>(
    req: RequestObj<T>
  ): Promise<MethodResponse<T> | null> {
    if (this.verbose) {
      console.log(
        `wally requesting: ${req.method} w/ params: ${
          (req as any).params || 'none'
        }`
      );
    }

    if (!this.auth.getToken()) {
      // bandaid for courtyard, etc.
      // (eth_accounts might just be for checking loggedin status)
      if (req.method === WallyMethodName.ACCOUNTS) {
        return Promise.resolve([] as any);
      } else if (this.isWallyMethod(req.method)) {
        return this.deferredRequest(req);
      }
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
      if (!this.auth.isLoggingIn) {
        this.auth.login().then(() => {
          resolve(this.request(req));
        });
      } else {
        const listener = () => {
          this.messenger.removeListener(
            EmitterMessage.ACCOUNTS_CHANGED,
            listener
          );
          resolve(this.request(req));
        };
        this.messenger.addListener(EmitterMessage.ACCOUNTS_CHANGED, listener);
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
        this.auth.selectedAddress = address;
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
          Authorization: `Bearer ${this.auth.getToken()}`,
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
          Authorization: `Bearer ${this.auth.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method,
          params,
          clientId: this.clientId,
        }),
      });

      if (!resp.ok || resp.status >= 300) {
        console.error(
          `Wally server returned a non-successful response when handling method: ${method}`
        );
      } else {
        const contentType = resp.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          const json = await resp.json();
          return json;
        } else {
          const text = await resp.text();
          return text as RPCResponse<T>;
        }
      }
    } catch (err) {
      console.error(
        `Wally server returned error: ${err} when handling method: ${method}`
      );
    }
    return Promise.reject(new Error(`Invalid response for ${method}`));
  }
}
