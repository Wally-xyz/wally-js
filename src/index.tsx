import React from "react";
import ReactDOM, { Root } from "react-dom/client";

import { LoginComponent } from "./widgets/Login";

import { APP_ROOT } from "./constants";
import { Wallet } from "./types";

export class WallyConnector {
  authToken: string | undefined = undefined;
  root: Root | undefined;

  constructor(authToken: string) {
    if (authToken) {
      this.authToken = authToken;
    }
  }

  setAuthToken = (authToken: string): void => {
    this.authToken = authToken;
    this.root?.unmount();
  };

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
    return this.requestGet("wallets");
  }

  authorise(): void {
    this.authToken = undefined;
    const anchor = document.createElement("div");
    document.body.appendChild(anchor);

    this.root = ReactDOM.createRoot(anchor);
    this.root.render(<LoginComponent setAuthToken={this.setAuthToken} />);
  }
}
