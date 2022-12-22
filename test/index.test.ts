import * as api from '../src/index';
import WallyJS from '../src/wally-js';
jest.mock('../src/wally-js');

describe('Public API', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    (WallyJS as jest.Mock).mockClear();
    consoleSpy = jest.spyOn(console, 'error');
    consoleSpy.mockImplementation(() => {});
  });

  afterEach(() => {
    api.clearInstance();
    consoleSpy.mockRestore();
  });

  describe('init', () => {
    it('shows a console error when not called on the client', () => {
      const windowSpy = jest.spyOn(window, 'window', 'get');
      windowSpy.mockImplementation(undefined);

      api.init({ clientId: '1234' });
      expect(console.error).toHaveBeenCalled();

      windowSpy.mockRestore();
    });

    it('creates a new wally instance', () => {
      api.init({ clientId: '1234' });
      expect(WallyJS).toHaveBeenCalled();
    });

    it('reuses existing wally instance', () => {
      api.init({ clientId: '1234' });
      api.init({ clientId: '1234' });
      expect(WallyJS).toHaveBeenCalledTimes(1);
      expect((WallyJS as jest.Mock).mock.instances.length).toBe(1);
    });

    it('checks for redirects', () => {
      jest
        .spyOn(WallyJS.prototype, 'isRedirected')
        .mockImplementation(() => false);
      api.init({ clientId: '1234' });
      const mockWally = (WallyJS as jest.Mock).mock.instances[0];
      expect(mockWally.isRedirected).toHaveBeenCalled();
      expect(mockWally.handleRedirect).toHaveBeenCalledTimes(0);

    });

    it('handles redirects', () => {
      jest
        .spyOn(WallyJS.prototype, 'isRedirected')
        .mockImplementation(() => true);
      api.init({ clientId: '1234' });
      const mockWally = (WallyJS as jest.Mock).mock.instances[0];
      expect(mockWally.handleRedirect).toHaveBeenCalled();
    });
  });

  describe('getProvider', () => {
    it('returns null and shows error when no module instance', () => {
      const ret = api.getProvider();
      expect(console.error).toHaveBeenCalled();
      expect(ret).toEqual(null);
    });

    it('does not show error when suppressed', () => {
      const ret = api.getProvider(true);
      expect(console.error).toHaveBeenCalledTimes(0);
      expect(ret).toEqual(null);
    });

    it('returns the module instance when there', () => {
      api.init({ clientId: '1234' });
      const ret = api.getProvider(true);
      const mockWally = (WallyJS as jest.Mock).mock.instances[0];
      expect(ret).toEqual(mockWally);
    });
  });

  describe('login', () => {
    it('throws error when there is no wally instance', () => {
      return expect(api.login()).rejects.toThrowError();
    });

    it('throws error when already logged in', () => {
      jest
        .spyOn(WallyJS.prototype, 'isLoggedIn')
        .mockImplementation(() => true);
      api.init({ clientId: '1234' });
      return expect(api.login()).rejects.toThrowError();
    });

    it('calls the login class method', () => {
      api.init({ clientId: '1234' });
      api.login();
      const mockWally = (WallyJS as jest.Mock).mock.instances[0];
      expect(mockWally.login).toHaveBeenCalled();
    });

    it('calls the login class method with passed email argument', () => {
      const email = 'foo@bar.net';
      api.init({ clientId: '1234' });
      api.login(email);
      const mockWally = (WallyJS as jest.Mock).mock.instances[0];
      expect(mockWally.login).toHaveBeenCalledWith(email);
    });
  });

  describe('finishLogin', () => {
    it('does nothing when no wally instance', () => {
      api.finishLogin('foo');
      expect((WallyJS as jest.Mock).mock.instances.length).toBe(0);
    });

    it('calls finishLogin on the wally instance', () => {
      const address = '0x1234';
      api.init({ clientId: '1234' });
      api.finishLogin(address);
      const mockWally = (WallyJS as jest.Mock).mock.instances[0];
      expect(mockWally.finishLogin).toHaveBeenCalledWith(address);
    });
  });

  describe('logout', () => {
    it('calls the logout instance method', () => {
      api.init({ clientId: '1234' });
      api.logout();
      const mockWally = (WallyJS as jest.Mock).mock.instances[0];
      expect(mockWally.logout).toHaveBeenCalled();
    });
  });

  describe('clearInstance', () => {
    it('sets wally instance to null', () => {
      api.init({ clientId: '1234' });
      expect(api.getProvider()).toBeDefined();
      api.clearInstance();
      expect(api.getProvider()).toBeNull();
    });
  });
});
