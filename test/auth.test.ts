import Auth from '../src/auth';
import Messenger from '../src/messenger';
import { EmitterMessage, WorkerMessage } from '../src/types';

describe('Auth', () => {
  let windowOpenSpy: jest.SpyInstance;
  let messenger: Messenger;
  const portStartSpy = jest.fn();
  const portPostSpy = jest.fn();

  beforeEach(() => {
    windowOpenSpy = jest.spyOn(window, 'open');
    windowOpenSpy.mockImplementation(() => {});
    SharedWorker = jest.fn(
      () =>
        ({
          port: {
            start: portStartSpy,
            postMessage: portPostSpy,
          },
        } as any)
    );
    messenger = new Messenger({
      sharedWorkerUrl: '/werker.js',
    });
    portPostSpy.mockImplementation((name) =>
      messenger.handleWorkerMessage(name)
    );
  });

  afterEach(() => {
    windowOpenSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    const authToken = 'asdf';
    const clientId = '1234';
    let storageSetSpy: jest.SpyInstance;

    beforeEach(() => {
      storageSetSpy = jest.spyOn(Storage.prototype, 'setItem');
    });

    afterEach(() => {
      storageSetSpy.mockRestore();
    });

    it('sets the auth token if passed', () => {
      new Auth({
        clientId,
        host: 'http://localhost:1738',
        authToken,
        messenger,
      });
      expect(storageSetSpy).toHaveBeenCalledWith('wally:1234:token', authToken);
    });
  });

  describe('login', () => {
    const clientId = '1234';
    const host = 'http://localhost:1738';
    let auth: Auth;
    let consoleSpy: jest.SpyInstance;
    let genCodeSpy: jest.SpyInstance;
    let storageSetSpy: jest.SpyInstance;
    let storageGetSpy: jest.SpyInstance;
    let closeSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error');
      consoleSpy.mockImplementation(() => {});
      genCodeSpy = jest.spyOn(Auth.prototype as any, 'generateStateCode');
      storageSetSpy = jest.spyOn(Storage.prototype, 'setItem');
      storageGetSpy = jest.spyOn(Storage.prototype, 'getItem');
      closeSpy = jest.spyOn(global.window, 'close');
      closeSpy.mockImplementation(() => {});

      auth = new Auth({
        clientId,
        host,
        authToken: 'asdf',
        messenger,
      });
    });

    afterEach(() => {
      auth = undefined as any;
      consoleSpy.mockRestore();
      genCodeSpy.mockRestore();
      storageSetSpy.mockRestore();
      storageGetSpy.mockRestore();
      closeSpy.mockRestore();
    });

    it('rejects if already logging in', () => {
      auth.isLoggingIn = true;
      return expect(auth.login()).rejects.toThrow();
    });

    it('shows console error if no client id set', () => {
      auth = new Auth({} as any);
      auth.login();
      expect(consoleSpy).toHaveBeenCalled();
      expect(genCodeSpy).toHaveBeenCalledTimes(0);
    });

    it('opens a window to the wally api login page with clientId and state', () => {
      const state = 'mississippi';
      jest
        .spyOn(Auth.prototype as any, 'generateStateCode')
        .mockImplementation(() => state);

      auth.login();

      expect(storageSetSpy).toHaveBeenCalledWith(
        `wally:${clientId}:state:token`,
        state
      );
      expect(windowOpenSpy).toHaveBeenCalledWith(
        `${host}/oauth/otp?clientId=${clientId}&state=${state}`,
        '_blank'
      );
    });

    it('passes redirectUrl and email when set', () => {
      const state = 'mississippi';
      const email = 'joe@smith.net';
      const redirectURL = 'http://salmonofcapistrano.com';

      genCodeSpy.mockImplementation(() => state);

      auth = new Auth({
        clientId,
        host,
        redirectURL,
        messenger,
      } as any);
      auth.login(email);

      expect(windowOpenSpy).toHaveBeenCalledWith(
        `${host}/oauth/otp?clientId=${clientId}&state=${state}&redirectUrl=${encodeURIComponent(
          redirectURL
        )}&email=${encodeURIComponent(email)}`,
        '_blank'
      );
    });

    // NOTE: This is just the happy-path.
    // More edge cases are tested below in 'returned promise' and 'redirect'
    it('can get all the way through the login flow with handled redirect', () => {
      const state = 'california';
      delete (global.window as any).location;
      global.window.location = {
        search: `?state=${state}&authorization_code=asdf1234`,
      } as any;
      genCodeSpy.mockImplementation(() => state);
      storageGetSpy.mockImplementation(() => state);
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              token: 'asdf',
              wallet: '0x1234',
            }),
        })
      ) as any;

      setTimeout(async () => {
        await auth.handleRedirect();
      });

      return auth.login().then(
        () => {
          expect(true).toBe(true);
        },
        () => {
          expect(false).toBe(true);
        }
      );
    });

    describe('returned promise', () => {
      let emitterAddSpy: jest.SpyInstance;
      let tokenSpy: jest.SpyInstance;
      let consoleSpy: jest.SpyInstance;
      let workerSpy: jest.SpyInstance;

      beforeEach(() => {
        emitterAddSpy = jest.spyOn(Messenger.prototype, 'addListener');
        workerSpy = jest.spyOn(Messenger.prototype, 'onWorkerMessage');
        tokenSpy = jest.spyOn(Auth.prototype, 'getToken');
        consoleSpy = jest.spyOn(console, 'error');
        consoleSpy.mockImplementation(() => {});
      });

      afterEach(() => {
        emitterAddSpy.mockRestore();
        workerSpy.mockRestore();
        tokenSpy.mockRestore();
        consoleSpy.mockRestore();
      });

      it('attaches message listeners', () => {
        auth.login();
        expect(emitterAddSpy).toHaveBeenCalled();
        expect(workerSpy).toHaveBeenCalledTimes(2);
        expect(workerSpy.mock.calls[0][0]).toBe(WorkerMessage.LOGIN_SUCCESS);
        expect(workerSpy.mock.calls[1][0]).toBe(WorkerMessage.LOGIN_FAILURE);
      });

      it('resolves on the accounts changed emitter message', () => {
        setTimeout(() => {
          auth['messenger'].emit(EmitterMessage.ACCOUNTS_CHANGED, '0x1234');
        }, 0);

        expect.assertions(1);
        return auth.login().then(
          () => {
            expect(true).toBe(true);
          },
          () => {
            expect(false).toBe(true);
          }
        );
      });

      it('resolves on the login success worker message when token', () => {
        tokenSpy.mockImplementation(() => 'asdf');

        setTimeout(() => {
          auth['messenger'].handleWorkerMessage(WorkerMessage.LOGIN_SUCCESS);
        }, 0);

        expect.assertions(1);
        return auth.login().then(
          () => {
            expect(true).toBe(true);
          },
          () => {
            expect(false).toBe(true);
          }
        );
      });

      it('rejects on the login success worker message when no token', async () => {
        tokenSpy.mockImplementation(() => null);

        setTimeout(() => {
          auth['messenger'].handleWorkerMessage(WorkerMessage.LOGIN_SUCCESS);
        }, 0);

        await expect(auth.login()).rejects.toThrowError();
        expect(consoleSpy).toHaveBeenCalled();
      });

      it('rejects on the login failure worker message', async () => {
        setTimeout(() => {
          auth['messenger'].handleWorkerMessage(WorkerMessage.LOGIN_FAILURE);
        }, 0);

        await expect(auth.login()).rejects.toThrowError();
        expect(consoleSpy).toHaveBeenCalled();
      });
    });
  });

  describe('redirect', () => {
    let clientId = '1234';
    let host = 'http://localhost:1738';
    let auth: Auth;
    let consoleSpy: jest.SpyInstance;
    let storageGetSpy: jest.SpyInstance;
    let storageSetSpy: jest.SpyInstance;
    let storageRemoveSpy: jest.SpyInstance;
    let onTokenFetchedSpy: any = jest.fn();

    beforeEach(() => {
      auth = new Auth({
        clientId,
        host,
        messenger,
        _onTokenFetched: onTokenFetchedSpy,
      });
      storageGetSpy = jest.spyOn(Storage.prototype, 'getItem');
      storageSetSpy = jest.spyOn(Storage.prototype, 'setItem');
      storageRemoveSpy = jest.spyOn(Storage.prototype, 'removeItem');
      consoleSpy = jest.spyOn(console, 'error');
      consoleSpy.mockImplementation(() => {});
    });

    afterEach(() => {
      auth = undefined as any;
      storageGetSpy.mockRestore();
      storageSetSpy.mockRestore();
      storageRemoveSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it.each([
      ['statestring', true],
      [null, false],
    ])('when state: "%s", redirected: "%s"', (state, expected) => {
      storageGetSpy.mockImplementation(() => state);
      expect(auth.isRedirected()).toBe(expected);
      expect(storageGetSpy).toBeCalledTimes(1);
    });

    it('does nothing if already handled redirect', () => {
      auth['didHandleRedirect'] = true;
      auth.handleRedirect();
      expect(storageGetSpy).not.toBeCalled();
    });

    it('rejects if state not equal', async () => {
      delete (global.window as any).location;
      global.window.location = {
        search: '?state=somethingelse',
      } as any;
      storageGetSpy.mockImplementation(() => 'something');

      await expect(auth.handleRedirect()).rejects.toThrowError();
      expect(storageRemoveSpy).toHaveBeenCalled();
    });

    it('makes a request with auth code', async () => {
      const state = 'state';
      const authCode = '1234';
      delete (global.window as any).location;
      global.window.location = {
        search: `?state=${state}&authorization_code=${authCode}`,
      } as any;
      storageGetSpy.mockImplementation(() => state);
      global.fetch = jest.fn();

      expect.assertions(1);
      await auth.handleRedirect();

      expect(global.fetch).toHaveBeenCalledWith(
        `${host}/oauth/token`,
        expect.objectContaining({
          body: JSON.stringify({ authCode }),
        })
      );
    });

    describe('response handling', () => {
      let consoleSpy: jest.SpyInstance;
      let messengerSpy: jest.SpyInstance;
      let timeoutSpy: jest.SpyInstance;
      let closeSpy: jest.SpyInstance;

      beforeEach(() => {
        const state = 'state';
        delete (global.window as any).location;
        global.window.location = {
          search: `?state=${state}`,
        } as any;
        storageGetSpy.mockImplementation(() => state);
        consoleSpy = jest.spyOn(console, 'error');
        consoleSpy.mockImplementation(() => {});
        messengerSpy = jest.spyOn(auth['messenger'], 'sendWorkerMessage');
        timeoutSpy = jest.spyOn(global, 'setTimeout');
        timeoutSpy.mockImplementation(((fn: any, _: any) => {
          fn();
        }) as any);
        closeSpy = jest.spyOn(global.window, 'close');
        closeSpy.mockImplementation(() => {});
      });

      afterEach(() => {
        consoleSpy.mockRestore();
        messengerSpy.mockRestore();
        timeoutSpy.mockRestore();
        closeSpy.mockRestore();
      });

      it('shows error, deletes state, and sends message on bad response', async () => {
        global.fetch = jest.fn(() => undefined as any);

        await auth.handleRedirect();

        expect(consoleSpy).toHaveBeenCalled();
        expect(storageRemoveSpy).toHaveBeenCalled();
        expect(messengerSpy).toHaveBeenCalledWith(WorkerMessage.LOGIN_FAILURE);
      });

      it('finishes login when ok response', async () => {
        const token = 'asdfqewr';
        const wallet = '0xuipjk';
        global.fetch = jest.fn(() =>
          Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
              Promise.resolve({
                token,
                wallet,
              }),
          })
        ) as any;

        await auth.handleRedirect();

        expect(storageSetSpy).toHaveBeenCalledWith(
          `wally:${clientId}:token`,
          token
        );
        expect(auth.selectedAddress).toBe(wallet);
        expect(onTokenFetchedSpy).toHaveBeenCalledWith(wallet);
        expect(messengerSpy).toHaveBeenCalledWith(WorkerMessage.LOGIN_SUCCESS);
        expect(setTimeout).toHaveBeenCalled();
        expect(global.window.close).toHaveBeenCalled();
      });
    });
  });

  describe('generateStateCode', () => {
    it('returns a random 10 character string', () => {
      const auth = new Auth({} as any);
      const ret = auth['generateStateCode']();
      expect(ret.length).toBe(10);
    });

    it('returns a random n character string', () => {
      const n = Math.floor(Math.random() * 100);
      const auth = new Auth({} as any);
      const ret = auth['generateStateCode'](n);
      expect(ret.length).toBe(n);
    });
  });
});
