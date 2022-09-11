import { SignedMessage, WallyConnectorOptions } from './types';

export class WallyConnector {
  constructor(private readonly clientId: string, private readonly opts?: WallyConnectorOptions) {}

  public loginWithEmail() {
    const state = this.generateStateCode();
    this.saveState(state);
    const queryParams = new URLSearchParams({ clientId: this.clientId, state });
    window.location.replace((this.opts?.test)
      ? `https://api.wally.xyz/oauth/otp?${queryParams.toString()}`
      : `http://localhost:3000/oauth/otp?${queryParams.toString()}`
    );
  }

  public isRedirected() {
    return this.getState() !== null;
  }

  public async handleRedirect() {
    const storedState = this.getState();
    const queryParams = new URLSearchParams(window.location.search);
    if (storedState && storedState !== queryParams.get('state')) {
      throw new Error('Invalid state');
    }
    this.deleteState();
    const authCode = queryParams.get('authorization_code');

    // TODO: exchange auth code for token
  }

  private setAuthToken(authToken: string): void {
    localStorage.setItem(`wally:${this.clientId}:token`, authToken);
  };

  private getAuthToken(): string | null {
    return localStorage.getItem(`wally:${this.clientId}:token`);
  }

  private generateStateCode(length = 10) {
    const chars = [];
    for (let i = 0; i < 26; i++) {
      chars.push(String.fromCharCode('a'.charCodeAt(0) + i));
      chars.push(String.fromCharCode('A'.charCodeAt(0) + i));
    }
    for (let i = 0; i < 10; i++) {
      chars.push('0'.charCodeAt(0) + i);
    }

    const authCode = [];
    for (let charCount = 0; charCount < length; charCount++) {
      const randInt = Math.floor(Math.random() * chars.length);
      authCode.push(chars[randInt]);
    }
    return authCode.join('');
  }

  private saveState(state: string) {
    localStorage.setItem(`wally:${this.clientId}:state:token`, state);
  }

  private getState(): string | null {
    return localStorage.getItem(`wally:${this.clientId}:state:token`);
  }

  private deleteState() {
    localStorage.removeItem(`wally:${this.clientId}:state:token`);
  }

  async signMessage(message: string): Promise<SignedMessage> {
    const queryString = new URLSearchParams({ message }).toString();
    const resp = await fetch(`/app/user/sign-message?${queryString}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!resp.ok || resp.status >= 300) {
      throw new Error('Server returned a non-successful response');
    }
    return await resp.json() as Promise<SignedMessage>;
  }
}
