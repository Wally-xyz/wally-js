import { APP_ROOT } from '../src/constants';
import { EmitterMessage, RequestObj } from '../src/types';
import WallyJS from '../src/wally-js';
import Auth from '../src/auth';
import Messenger from '../src/messenger';
import Requester from '../src/requester';
jest.mock('../src/auth');
jest.mock('../src/messenger');
jest.mock('../src/requester');

describe('WallyJS Class Methods', () => {
  beforeEach(() => {
    (Auth as jest.Mock).mockClear();
    (Messenger as jest.Mock).mockClear();
    (Requester as jest.Mock).mockClear();
  });

  describe('constructor', () => {
    it('passes the devUrl in dev mode', () => {
      const _devUrl = 'http://salmonofcapistrano.com';
      new WallyJS({ clientId: '1234', _devUrl, _isDevelopment: true });
      expect(Auth).toHaveBeenCalledWith({
        clientId: '1234',
        _isDevelopment: true,
        host: _devUrl,
        messenger: (Messenger as jest.Mock).mock.instances[0],
      });
    });

    it('uses the default app root when not in dev mode', () => {
      const _devUrl = 'http://salmonofcapistrano.com';
      new WallyJS({ clientId: '1234', _devUrl });
      expect(Auth).toHaveBeenCalledWith({
        clientId: '1234',
        host: APP_ROOT,
        messenger: (Messenger as jest.Mock).mock.instances[0],
      });
    });
  });

  describe('finishLogin', () => {
    let wally: WallyJS;
    let mockMessenger: any;

    beforeEach(() => {
      wally = new WallyJS({ clientId: '1234' });
      mockMessenger = (Messenger as jest.Mock).mock.instances[0];
    });

    it('does nothing if not in the middle of logging in', () => {
      wally['auth'].isLoggingIn = false;
      wally.finishLogin('foo');
      expect(mockMessenger.emit).toHaveBeenCalledTimes(0);
    });

    it('emits messages with address', () => {
      const addr = '0x1234';
      wally['auth'].isLoggingIn = true;
      wally.finishLogin(addr);
      expect(mockMessenger.emit).toHaveBeenCalledTimes(2);
      expect(mockMessenger.emit).toHaveBeenCalledWith(
        EmitterMessage.ACCOUNTS_CHANGED,
        addr
      );
      expect(mockMessenger.emit).toHaveBeenCalledWith(EmitterMessage.CONNECTED);
      expect(wally['auth'].isLoggingIn).toBe(false);
    });
  });

  describe('messenger methods', () => {
    let wally: WallyJS;
    let mockMessenger: any;
    const name = 'foo';
    const fn = () => {};

    beforeEach(() => {
      wally = new WallyJS({ clientId: '1234' });
      mockMessenger = (Messenger as jest.Mock).mock.instances[0];
    });

    it('calls addListener', () => {
      wally.on(name, fn);
      expect(mockMessenger.addListener).toHaveBeenCalledWith(name, fn);
    });

    it('calls removeListener', () => {
      wally.removeListener(name, fn);
      expect(mockMessenger.removeListener).toHaveBeenCalledWith(name, fn);
    });

    it('calls removeAllListeners', () => {
      wally.removeAllListeners(name);
      expect(mockMessenger.removeAllListeners).toHaveBeenCalledWith(name);
    });
  });

  describe('auth methods', () => {
    let wally: WallyJS;
    let mockAuth: any;

    beforeEach(() => {
      wally = new WallyJS({ clientId: '1234' });
      mockAuth = (Auth as jest.Mock).mock.instances[0];
    });

    it('calls login', () => {
      const email = 'foo@bar.net';
      wally.login(email);
      expect(mockAuth.login).toHaveBeenCalledWith(email);
    });

    it('calls clearAuthToken', () => {
      wally.logout();
      expect(mockAuth.clearAuthToken).toHaveBeenCalled();
    });

    it('calls isRedirected', () => {
      wally.isRedirected();
      expect(mockAuth.isRedirected).toHaveBeenCalled();
    });

    it('calls getAuthToken', () => {
      wally.isLoggedIn();
      expect(mockAuth.getToken).toHaveBeenCalled();
    });

    it('calls handleRedirect', () => {
      wally.handleRedirect();
      expect(mockAuth.handleRedirect).toHaveBeenCalled();
    });
  });

  describe('requester methods', () => {
    let wally: WallyJS;
    let mockRequester: any;

    beforeEach(() => {
      wally = new WallyJS({ clientId: '1234' });
      mockRequester = (Requester as jest.Mock).mock.instances[0];
    });

    it('calls request', () => {
      const reqObj: RequestObj<'eth_requestAccounts'> = {
        method: 'eth_requestAccounts',
      };
      wally.request(reqObj);
      expect(mockRequester.request).toHaveBeenCalledWith(reqObj);
    });
  });

  describe('deprecated methods', () => {
    let wally: WallyJS;

    beforeEach(() => {
      wally = new WallyJS({ clientId: '1234' });
    });

    it('calls isLoggedIn', () => {
      wally.isLoggedIn = jest.fn();
      wally.isConnected();
      expect(wally.isLoggedIn).toHaveBeenCalled();
    });

    it('calls on', () => {
      const name = 'foo';
      const fn = () => {};
      wally.on = jest.fn();
      wally.addListener(name, fn);
      expect(wally.on).toHaveBeenCalledWith(name, fn);
    });

    it('calls request', () => {
      const req = { yes: 'maam' };
      wally.request = jest.fn();
      wally.sendAsync(req);
      expect(wally.request).toHaveBeenCalledWith(req);
    });

    it('calls request with eth_requestAccounts', () => {
      wally.request = jest.fn();
      wally.enable();
      expect(wally.request).toHaveBeenCalledWith({
        method: 'eth_requestAccounts',
      });
    });
  });
});
