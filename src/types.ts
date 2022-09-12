export interface RequestObject {
  method: string;
  headers: {
    Authorization?: string;
    Accept: string;
    "Content-Type": string;
  };
  body?: string;
}

export interface CreateWalletRequest {
  email: string;
  reference?: string;
  tags?: string[];
}

export interface CreateWalletResponse {
  reference: string;
  address: string;
  tags: string[];
}
