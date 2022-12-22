import Auth from '../src/auth';
import Messenger from '../src/messenger';
import { EmitterMessage, WorkerMessage } from '../src/types';

describe('Auth', () => {
  let windowOpenSpy: any;

  beforeEach(() => {
    windowOpenSpy = jest.spyOn(window, 'open');
    windowOpenSpy.mockImplementation(() => {});
    SharedWorker = jest.fn(
      () =>
        ({
          port: {
            start: () => {},
            postMessage: () => {},
          },
        } as any)
    );
  });

  afterEach(() => {
    windowOpenSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('sets the auth token if passed', () => {
      const authToken = 'asdf';
      const clientId = '1234';
      const storageSpy = jest.spyOn(Storage.prototype, 'setItem');

      new Auth({
        clientId,
        host: 'http://localhost:1738',
        authToken,
        messenger: new Messenger({}),
      });
      expect(storageSpy).toHaveBeenCalledWith('wally:1234:token', authToken);

      storageSpy.mockRestore();
    });
  });

  describe('login', () => {
    const clientId = '1234';
    const host = 'http://localhost:1738';
    let auth: Auth;

    beforeEach(() => {
      auth = new Auth({
        clientId,
        host,
        authToken: 'asdf',
        messenger: new Messenger({
          sharedWorkerUrl: '/worker.js',
        }),
      });
    });

    afterEach(() => {
      auth = undefined as any;
    });

    it('rejects if already logging in', () => {
      auth.isLoggingIn = true;
      return expect(auth.login()).rejects.toBeDefined();
    });

    it('shows console error if no client id set', () => {
      const consoleSpy = jest.spyOn(console, 'error');
      consoleSpy.mockImplementation(() => {});
      const codeGenSpy = jest.spyOn(Auth.prototype as any, 'generateStateCode');
      auth = new Auth({} as any);
      auth.login();
      expect(consoleSpy).toHaveBeenCalled();
      expect(codeGenSpy).toHaveBeenCalledTimes(0);

      consoleSpy.mockRestore();
      codeGenSpy.mockRestore();
    });

    it('opens a window to the wally api login page with clientId and state', () => {
      const state = 'mississippi';
      const storageSpy = jest.spyOn(Storage.prototype, 'setItem');

      jest
        .spyOn(Auth.prototype as any, 'generateStateCode')
        .mockImplementation(() => state);

      auth.login();

      expect(storageSpy).toHaveBeenCalledWith(
        `wally:${clientId}:state:token`,
        state
      );
      expect(windowOpenSpy).toHaveBeenCalledWith(
        `${host}/oauth/otp?clientId=${clientId}&state=${state}`,
        '_blank'
      );

      storageSpy.mockRestore();
    });

    it('passes redirectUrl and email when set', () => {
      const state = 'mississippi';
      const email = 'joe@smith.net';
      const redirectURL = 'http://salmonofcapistrano.com';

      const genCodeSpy = jest.spyOn(Auth.prototype as any, 'generateStateCode');
      genCodeSpy.mockImplementation(() => state);

      auth = new Auth({
        clientId,
        host,
        redirectURL,
        messenger: new Messenger({}),
      } as any);
      auth.login(email);

      expect(windowOpenSpy).toHaveBeenCalledWith(
        `${host}/oauth/otp?clientId=${clientId}&state=${state}&redirectUrl=${encodeURIComponent(
          redirectURL
        )}&email=${encodeURIComponent(email)}`,
        '_blank'
      );
      genCodeSpy.mockRestore();
    });

    describe('returned promise', () => {
      it('attaches message listeners', () => {
        const emitterSpy = jest.spyOn(Messenger.prototype, 'addListener');
        const workerSpy = jest.spyOn(Messenger.prototype, 'onWorkerMessage');
        auth.login();
        expect(emitterSpy).toHaveBeenCalled();
        expect(workerSpy).toHaveBeenCalledTimes(2);
        expect(workerSpy.mock.calls[0][0]).toBe(WorkerMessage.LOGIN_SUCCESS);
        expect(workerSpy.mock.calls[1][0]).toBe(WorkerMessage.LOGIN_FAILURE);

        emitterSpy.mockRestore();
        workerSpy.mockRestore();
      });

      it('resolves on the accounts changed emitter message', async () => {
        setTimeout(() => {
          auth['messenger'].emit(EmitterMessage.ACCOUNTS_CHANGED, '0x1234');
        }, 0);

        await auth.login();
      });

      it('resolves on the login success worker message when token', async () => {
        const tokenSpy = jest.spyOn(Auth.prototype, 'getToken');
        tokenSpy.mockImplementation(() => 'asdf');

        setTimeout(() => {
          auth['messenger'].handleWorkerMessage(WorkerMessage.LOGIN_SUCCESS);
        }, 0);

        await auth.login();
        expect(tokenSpy).toHaveBeenCalled();
        tokenSpy.mockRestore();
      });

      it('rejects on the login success worker message when no token', async () => {
        const tokenSpy = jest.spyOn(Auth.prototype, 'getToken');
        tokenSpy.mockImplementation(() => null);
        const consoleSpy = jest.spyOn(console, 'error');
        consoleSpy.mockImplementation(() => {});

        setTimeout(() => {
          auth['messenger'].handleWorkerMessage(WorkerMessage.LOGIN_SUCCESS);
        }, 0);

        await expect(auth.login()).rejects.toThrowError();
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });

      it('rejects on the login failure worker message', async () => {
        const consoleSpy = jest.spyOn(console, 'error');
        consoleSpy.mockImplementation(() => {});

        setTimeout(() => {
          auth['messenger'].handleWorkerMessage(WorkerMessage.LOGIN_FAILURE);
        }, 0);

        await expect(auth.login()).rejects.toThrowError();
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });
    });
  });

  describe('redirect', () => {
    let clientId = '1234';
    let host = 'http://localhost:1738';
    let auth: Auth;
    let storageGetSpy: any;
    let storageSetSpy: any;
    let storageRemoveSpy: any;
    let onTokenFetchedSpy: any = jest.fn();

    beforeEach(() => {
      auth = new Auth({
        clientId,
        host,
        messenger: new Messenger({
          sharedWorkerUrl: '/worker.js',
        }),
        _onTokenFetched: onTokenFetchedSpy,
      });
      storageGetSpy = jest.spyOn(Storage.prototype, 'getItem');
      storageSetSpy = jest.spyOn(Storage.prototype, 'setItem');
      storageRemoveSpy = jest.spyOn(Storage.prototype, 'removeItem');
    });

    afterEach(() => {
      auth = undefined as any;
      storageGetSpy.mockRestore();
      storageSetSpy.mockRestore();
      storageRemoveSpy.mockRestore();
    });

    it.each([
      ['whatever', true],
      [null, false],
    ])('calls getState to determine if redirected', (state, expected) => {
      storageGetSpy.mockImplementation(() => state);
      expect(auth.isRedirected()).toBe(expected);
      expect(storageGetSpy).toBeCalled();
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
      const consoleSpy = jest.spyOn(console, 'error');
      consoleSpy.mockImplementation(() => {});
      global.fetch = jest.fn();

      expect.assertions(1);
      await auth.handleRedirect();

      expect(global.fetch).toHaveBeenCalledWith(
        `${host}/oauth/token`,
        expect.objectContaining({
          body: JSON.stringify({ authCode }),
        })
      );
      consoleSpy.mockRestore();
    });

    describe('response handling', () => {
      let consoleSpy: any;

      beforeEach(() => {
        const state = 'state';
        delete (global.window as any).location;
        global.window.location = {
          search: `?state=${state}`,
        } as any;
        storageGetSpy.mockImplementation(() => state);
        consoleSpy = jest.spyOn(console, 'error');
        consoleSpy.mockImplementation(() => {});
      });

      afterEach(() => {
        consoleSpy.mockRestore();
      });

      it('shows error, deletes state, and sends message on bad response', async () => {
        const messengerSpy = jest.spyOn(auth['messenger'], 'sendWorkerMessage');
        global.fetch = jest.fn(() => undefined as any);

        await auth.handleRedirect();

        expect(consoleSpy).toHaveBeenCalled();
        expect(storageRemoveSpy).toHaveBeenCalled();
        expect(messengerSpy).toHaveBeenCalledWith(WorkerMessage.LOGIN_FAILURE);
      });

      it('finishes login when ok response', async () => {
        const token = 'asdfqewr';
        const wallet = '0xuipjk';
        const messengerSpy = jest.spyOn(auth['messenger'], 'sendWorkerMessage');
        const timeoutSpy = jest.spyOn(global, 'setTimeout');
        timeoutSpy.mockImplementation(((fn: any, _: any) => {
          fn();
        }) as any);
        const closeSpy = jest.spyOn(global.window, 'close');
        closeSpy.mockImplementation(() => {});

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
