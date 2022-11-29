import { WallyConnectorOptions } from './types';

import WallyConnector from './wally-connector';

let wally: WallyConnector | null = null;

const checkInjected = () => {
  if (!wally) {
    console.error(
      "Couldn't find wally instance. Ensure init() method is called first."
    );
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

export const getProvider = (): WallyConnector | null => {
  if (!checkInjected()) {
    return null;
  }

  return wally;
};

export const login = async () => {
  if (!checkInjected() || (wally && wally.isLoggedIn())) {
    return Promise.reject();
  }

  return wally!.login();
};

export const finishLogin = (address: string): void => {
  if (!checkInjected()) {
    return;
  }

  wally!.finishLogin(address);
};
