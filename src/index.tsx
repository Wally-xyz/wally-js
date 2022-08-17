import React from "react";
import ReactDOM, { Root } from "react-dom/client";

import { LoginComponent } from "./components/Login";
import { request } from "./components/request";
import { VeriftOTPResult, Wallet } from "./types";

export class WallyConnector {
  appId: string | undefined = undefined;
  authToken: string | undefined = undefined;

  root: Root | undefined;

  constructor({ appId, authToken }: { appId: string; authToken: string }) {
    this.appId = appId;
    this.authToken = authToken;
  }

  setAuthToken = (authToken: string): void => {
    this.authToken = authToken;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async requestGet(url: string): Promise<any> {
    return request(this.authToken, "GET", url, undefined);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async requestPost(url: string, data?: Record<string, unknown>): Promise<any> {
    return request(this.authToken, "GET", url, data);
  }

  async getOTP(email: string): Promise<Wallet[]> {
    return this.requestPost("users/login", { email });
  }

  async verifyOTP(email: string, otp: string): Promise<VeriftOTPResult> {
    const result = this.requestPost("users/verifyOTP", {
      email,
      otp,
    }) as VeriftOTPResult;
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
