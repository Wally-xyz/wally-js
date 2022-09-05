import { request } from "./request";
import { VeriftOTPResult } from "./types";

export class WallyConnector {
  private authToken: string | undefined = undefined;

  private setAuthToken = (authToken: string): void => {
    this.authToken = authToken;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async requestGet(url: string, isAuthenticated?: boolean): Promise<any> {
    return request(this.authToken, "GET", url, undefined, isAuthenticated);
  }

  private async requestPost(
    url: string,
    data?: Record<string, unknown>,
    isAuthenticated?: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    return request(this.authToken, "POST", url, data, isAuthenticated);
  }

  public async getOTP(email: string): Promise<void> {
    return this.requestPost("users/login", { email }, false);
  }
}
