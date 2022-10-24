import {
  WallyConnectorOptions,
  RedirectOptions,
} from './types';

import WallyConnector from './wally-connector';


declare global {
  // eslint-disable-next-line no-var
  var wally: WallyConnector
}

export const init = (options: WallyConnectorOptions): void => {
  if (typeof window === 'undefined') {
    console.error('Ensure init() is called on the client only.');
    return;
  }
  window.wally = window.wally || new WallyConnector(options);
};

export const handleRedirect = (options: RedirectOptions): void => {
  if (!window.wally) {
    console.error('Couldn\'t find wally instance. Ensure init() method is called first.');
    return;
  }
  window.wally.handleRedirect(options);
}

export const getProvider = (): WallyConnector | null => {
  if (!window.wally) {
    console.error('Couldn\'t find wally instance. Ensure init() method is called first.');
    return null;
  }
  return window.wally;
}
