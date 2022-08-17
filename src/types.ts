export type Wallet = {
  id: string;
  email: string;
  address: string;
  tags: string[];
  referenceId: string;
};

export type VeriftOTPResult = { token?: string };
