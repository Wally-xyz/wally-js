export type SignedMessage = {
  address: string;
  signature: string;
};

export type WallyConnectorOptions = {
  isDevelopment?: boolean;
};

export type Wallet = {
  id: string;
  email: string;
  address: string;
  tags: string[];
  referenceId: string;
};
