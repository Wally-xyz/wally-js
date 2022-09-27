import { SignedMessage, WallyConnectorOptions } from './types';

export class WallyConnector {
  private host: string;

  constructor(private readonly clientId: string, private readonly options?: WallyConnectorOptions) {
    this.host = (this.options?.isDevelopment) ? 'http://localhost:3000' : 'https://api.wally.xyz';
  }

  public loginWithEmail() {
    const state = this.generateStateCode();
    this.saveState(state);
    const queryParams = new URLSearchParams({ clientId: this.clientId, state });
    window.location.replace((this.options?.isDevelopment)
      ? `${this.host}/oauth/otp?${queryParams.toString()}`
      : `${this.host}/oauth/otp?${queryParams.toString()}`
    );
  }

  public isRedirected() {
    return this.getState() !== null;
  }

  public async handleRedirect() {
    const storedState = this.getState();
    const queryParams = new URLSearchParams(window.location.search);
    if (storedState && storedState !== queryParams.get('state')) {
      this.deleteState();
      if (this.options?.isDevelopment) {
        console.error('Invalid Wally state');
      }
    }
    this.deleteState();
    const authCode = queryParams.get('authorization_code');

    let resp: Response;
    try {
      resp = await fetch(`${this.host}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          authCode,
        }),
      });
      if (resp && (!resp?.ok || resp?.status >= 300)) {
        const data = await resp.json();
        this.setAuthToken(data.token);
      } else {
        this.deleteState();
        console.error('The Wally server returned a non-successful response when exchanging authorization code for token');
      }
    } catch (err) {
      console.error(`Unable to fetch Wally access token: ${err}`);
      this.deleteState();
    }
  }

  private setAuthToken(authToken: string): void {
    localStorage.setItem(`wally:${this.clientId}:token`, authToken);
  }

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
    const resp = await fetch(`${this.host}/app/user/sign-message?${queryString}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!resp.ok || resp.status >= 300) {
      throw new Error('Wally server returned a non-successful response when signing a message');
    }
    return await resp.json() as Promise<SignedMessage>;
  }
}
