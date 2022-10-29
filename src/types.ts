export type SignedMessage = {
  address: string;
  signature: string;
};

export type WallyConnectorOptions = {
  clientId: string,
  isDevelopment?: boolean;
  devUrl?: string;
};

export type RedirectOptions = {
  closeWindow?: boolean;
  appendContent?: boolean;
};

export interface RequestObj {
  method: MethodName;
  params: any;
}

export interface RpcEvent {
  event: 'rpc',
  type: string,
  value: any,
}

export enum MethodName {
  REQUEST_ACCOUNTS = 'eth_requestAccounts',
  PERSONAL_SIGN = 'personal_sign',
  SIGN = 'eth_sign',
  GET_BALANCE = 'eth_getBalance',
  SUBSCRIBE = 'eth_subscribe',
}

export enum WorkerMessage {
  LOGIN_SUCCESS = 'login-success',
  LOGIN_FAILURE = 'login-failure',
}
