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

export enum MethodName {
  'eth_requestAccounts' = 'eth_requestAccounts',
  'personal_sign' = 'personal_sign',
  'eth_sign' = 'eth_sign',
  'eth_getBalance' = 'eth_getBalance',
}
