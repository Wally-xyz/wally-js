import React from "react";
import ReactDOM, { Root } from "react-dom/client";

import { LoginComponent } from "./components/Login";
import { request } from "./request";
import { VeriftOTPResult, Wallet } from "./types";

export class WallyConnector {
  appId: string | undefined = undefined;
  authToken: string | undefined = undefined;

  root: Root | undefined;

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

  async getWallets(): Promise<Wallet[]> {
    return this.requestGet("wallets");
  }

  authorise(): void {
    this.authToken = undefined;
    const anchor = document.createElement("div");
    document.body.appendChild(anchor);

    this.root = ReactDOM.createRoot(anchor);
    this.root.render(
      <LoginComponent
        setAuthToken={(tkn: string) => {
          this.setAuthToken(tkn);
          this.root?.unmount();
        }}
      />
    );
  }
}
