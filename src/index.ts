import { APP_ROOT } from "./constants";
import { Wallet } from "./types";

export class WallyConnector {
  authToken: string | undefined = undefined;

  constructor(authToken: string) {
    this.authToken = authToken;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async requestGet(url: string): Promise<any> {
    if (!this.authToken) {
      console.error("--- UNAUTHORISED ---");
    }
    const response = await fetch(`${APP_ROOT}${url}`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`,
      },
    });
    return response.json();
  }

  async getWallets(): Promise<Wallet[]> {
    return this.requestGet("/wallets");
  }
}
