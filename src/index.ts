import { request } from "./request";
import { SignedMessage, VeriftOTPResult, Wallet } from "./types";

export class WallyConnector {
  appId: string | undefined = undefined;
  authToken: string | undefined = undefined;

  constructor({
    appId,
    authToken,
  }: { appId?: string; authToken?: string } = {}) {
    // TODO: is appId required field
    this.appId = appId;
    this.authToken = authToken;
  }

  setAuthToken = (authToken: string): void => {
    this.authToken = authToken;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async requestGet(url: string, isAuthenticated?: boolean): Promise<any> {
    return request(this.authToken, "GET", url, undefined, isAuthenticated);
  }

  async requestPost(
    url: string,
    data?: Record<string, unknown>,
    isAuthenticated?: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    return request(this.authToken, "POST", url, data, isAuthenticated);
  }

  async getOTP(email: string): Promise<Wallet[]> {
    return this.requestPost("users/login", { email }, false);
  }

  async verifyOTP(email: string, OTP: string): Promise<VeriftOTPResult> {
    const result = this.requestPost(
      "users/verifyOTP",
      {
        email,
        OTP,
      },
      false
    ) as VeriftOTPResult;
    if (result.token) {
      this.authToken = result.token;
    }
    return result;
  }

  async signMessage(message: string): Promise<SignedMessage> {
    return this.requestPost(
      "users/sign-message",
      { message, appId: this.appId },
      false
    );
  }

  async getWallets(): Promise<Wallet[]> {
    return this.requestGet("users/wallets");
  }
}
