import { WallyConnectorOptions } from './types';

import WallyConnector from './wally-connector';

declare global {
  // eslint-disable-next-line no-var
  var wally: WallyConnector;
}

const checkInjected = () => {
  if (!window.wally) {
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
  window.wally = window.wally || new WallyConnector(options);

  if (window.wally.isRedirected()) {
    window.wally.handleRedirect();
  }

  return;
};

export const getProvider = (): WallyConnector | null => {
  if (!checkInjected()) {
    return null;
  }

  return window.wally;
};

export const login = (): Promise<void> => {
  if (!checkInjected() || window.wally.isLoggedIn()) {
    return Promise.reject();
  }

  return window.wally.login();
};

export const finishLogin = (address: string): void => {
  if (!checkInjected()) {
    return;
  }

  return window.wally.finishLogin(address);
};
