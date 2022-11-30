import { WallyConnectorOptions } from './types';

import WallyConnector from './wally-connector';

let wally: WallyConnector | null = null;

const checkInjected = (supress?: boolean) => {
  if (!wally) {
    if (!supress) {
      console.error(
        "Couldn't find wally instance. Ensure init() method is called first."
      );
    }
    return false;
  }
  return true;
};

export const init = (options: WallyConnectorOptions): void => {
  if (typeof window === 'undefined') {
    console.error('Ensure init() is called on the client only.');
    return;
  }
  wally = wally || new WallyConnector(options);

  if (wally.isRedirected()) {
    wally.handleRedirect();
  }

  return;
};

export const getProvider = (supress?: boolean): WallyConnector | null => {
  if (!checkInjected(supress)) {
    return null;
  }

  return wally;
};

/**
 * Must be used if `disableLoginOnRequest` is true.
 * Can optionally pass in an email to sign up. [wip]
 * @param email
 * @returns
 */
export const login = async (email?: string) => {
  if (!checkInjected() || (wally && wally.isLoggedIn())) {
    return Promise.reject();
  }

  return wally!.login(email);
};

export const finishLogin = (address: string): void => {
  if (!checkInjected()) {
    return;
  }

  wally!.finishLogin(address);
};
