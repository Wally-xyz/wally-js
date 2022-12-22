import Requester from '../src/requester';
import Auth from '../src/auth';
import Messenger from '../src/messenger';
import { EmitterMessage, RPCMethodName, WallyMethodName } from '../src/types';
import { WALLY_ROUTES } from '../src/constants';

const mockFetchWith = (data: any) =>
  jest.fn(
    () =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(data),
      }) as any
  );

describe('Requester', () => {
  describe('logged out', () => {
    let requester: Requester;
    let tokenSpy: any;

    beforeEach(() => {
      requester = new Requester({
        host: 'localhost',
        clientId: '1234',
        auth: new Auth({} as any),
        messenger: new Messenger({} as any),
      });
      tokenSpy = jest.spyOn(requester['auth'], 'getToken');
      tokenSpy.mockImplementation(() => '');
    });

    afterEach(() => {
      requester = undefined as any;
      tokenSpy.mockRestore();
    });

    it('returns an empty resolved promise for eth_accounts', async () => {
      return expect(
        requester.request({ method: 'eth_accounts' })
      ).resolves.toEqual([]);
    });

    it('logs when verbose is enabled', async () => {
      requester = new Requester({
        verbose: true,
        host: 'localhost',
        clientId: '1234',
        auth: new Auth({} as any),
        messenger: new Messenger({} as any),
      });
      const consoleSpy = jest.spyOn(console, 'log');
      consoleSpy.mockImplementation(() => {});
      await requester.request({ method: 'eth_accounts' });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('requests login and tries again when wally method', async () => {
      const reqObj = {
        method: WallyMethodName.SIGN,
        params: ['0x1', 'foo'],
      };
      const resolution = 'resolved';
      requester['auth'].isLoggingIn = false;
      const loginSpy = jest.spyOn(requester['auth'], 'login');
      let requestSpy = jest.spyOn(requester, 'request');
      loginSpy.mockImplementation(() => {
        requestSpy.mockImplementation(() => {
          return resolution as any;
        });
        return Promise.resolve();
      });

      const ret = await requester.request(reqObj as any);

      expect(ret).toBe(resolution);
      expect(loginSpy).toHaveBeenCalled();
      expect(requestSpy).toHaveBeenCalledTimes(2);
      expect(requestSpy.mock.calls[0][0]).toEqual(reqObj);
      expect(requestSpy.mock.calls[1][0]).toEqual(reqObj);
    });

    it('adds login emitter listener when already logging in', async () => {
      const reqObj = {
        method: WallyMethodName.SIGN,
        params: ['0x1', 'foo'],
      };
      const resolution = 'resolved';
      requester['auth'].isLoggingIn = true;
      let requestSpy = jest.spyOn(requester, 'request');
      const addListenerSpy = jest.spyOn(requester['messenger'], 'addListener');
      addListenerSpy.mockImplementation((name: any, cb: any) => {
        expect(name).toBe(EmitterMessage.ACCOUNTS_CHANGED);
        requestSpy.mockImplementation(() => {
          return resolution as any;
        });
        cb();
      });
      const removeListenerSpy = jest.spyOn(
        requester['messenger'],
        'removeListener'
      );

      const ret = await requester.request(reqObj as any);

      expect(ret).toBe(resolution);
      expect(removeListenerSpy).toHaveBeenCalled();
      expect(addListenerSpy).toHaveBeenCalled();
      expect(requestSpy).toHaveBeenCalledTimes(2);
      expect(requestSpy.mock.calls[0][0]).toEqual(reqObj);
      expect(requestSpy.mock.calls[1][0]).toEqual(reqObj);
    });
  });

  describe('wally request', () => {
    let requester: Requester;
    let tokenSpy: any;
    let token = 'token';
    let host = 'http://localhost:1738';

    beforeEach(() => {
      requester = new Requester({
        host,
        clientId: '1234',
        auth: new Auth({} as any),
        messenger: new Messenger({} as any),
      });
      tokenSpy = jest.spyOn(requester['auth'], 'getToken');
      tokenSpy.mockImplementation(() => token);
    });

    afterEach(() => {
      requester = undefined as any;
      tokenSpy.mockRestore();
    });

    it.each([[WallyMethodName.ACCOUNTS], [WallyMethodName.REQUEST_ACCOUNTS]])(
      'correctly formats an account request and response',
      async (method) => {
        const address = '0x1234';
        global.fetch = mockFetchWith({ address });

        const ret = await requester.request({
          method,
        } as any);

        expect(ret).toEqual([address]);
        expect(global.fetch).toHaveBeenCalledWith(
          `${host}/oauth/${WALLY_ROUTES[WallyMethodName.REQUEST_ACCOUNTS]}`,
          expect.objectContaining({
            headers: { Authorization: `Bearer ${token}` },
          })
        );
      }
    );

    it.each([
      [WallyMethodName.SIGN, ['0x1234', 'message']],
      [WallyMethodName.PERSONAL_SIGN, ['message', '0x1234']],
    ])(
      'correctly formats a basic message sign request and response',
      async (method, params) => {
        const signature = '0x9876';
        global.fetch = mockFetchWith({ signature });

        const ret = await requester.request({
          method,
          params,
        } as any);

        expect(ret).toEqual(signature);
        expect(global.fetch).toHaveBeenCalledWith(
          `${host}/oauth/${WALLY_ROUTES[WallyMethodName.SIGN]}`,
          expect.objectContaining({
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: 'message' }),
          })
        );
      }
    );

    it.each([
      [WallyMethodName.SIGN_TYPED, ['0x1234', '{"data":"data"}']],
      [WallyMethodName.SIGN_TYPED_V4, ['0x1234', { data: 'data' }]],
    ])(
      'correctly formats a sign typed data request and response',
      async (method, params) => {
        const signature = '0x9876';
        global.fetch = mockFetchWith({ signature });

        const ret = await requester.request({
          method,
          params,
        } as any);

        expect(ret).toEqual(signature);
        expect(global.fetch).toHaveBeenCalledWith(
          `${host}/oauth/${WALLY_ROUTES[WallyMethodName.SIGN_TYPED]}`,
          expect.objectContaining({
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: '{"data":"data"}',
          })
        );
      }
    );

    it.each([
      [
        WallyMethodName.SIGN_TRANSACTION,
        [{ gas: '1', from: 'me', to: 'you' }],
        { signature: 'return' },
      ],
      [
        WallyMethodName.SEND_TRANSACTION,
        [{ gasLimit: '1', from: 'me', to: 'you' }],
        { hash: 'return' },
      ],
    ])(
      'correctly formats a transaction request and response',
      async (method, params, response) => {
        global.fetch = mockFetchWith(response);

        const ret = await requester.request({
          method,
          params,
        } as any);

        expect(ret).toEqual('return');
        expect(global.fetch).toHaveBeenCalledWith(
          `${host}/oauth/${WALLY_ROUTES[method]}`,
          expect.objectContaining({
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: '{"from":"me","to":"you","gasLimit":"1"}',
          })
        );
      }
    );

    it.each([
      [undefined],
      [{ ok: false }],
      [{ ok: true, status: 300 }],
      [
        {
          ok: true,
          status: 200,
          json: () => {
            throw new Error();
          },
        },
      ],
    ])('logs an error and rejects when not ok', (resp) => {
      global.fetch = jest.fn(() => Promise.resolve(resp) as any);
      const consoleSpy = jest.spyOn(console, 'error');
      consoleSpy.mockImplementation(() => {});
      expect.assertions(1);
      return requester.request({ method: 'eth_accounts' }).then(
        () => {
          expect(true).toBe(false);
        },
        () => {
          expect(consoleSpy).toHaveBeenCalled();
        }
      );
    });
  });

  describe('rpc request', () => {
    let requester: Requester;
    let tokenSpy: any;
    let token = 'token';
    let host = 'http://localhost:1738';
    let clientId = '1234';

    beforeEach(() => {
      requester = new Requester({
        host,
        clientId,
        auth: new Auth({} as any),
        messenger: new Messenger({} as any),
      });
      tokenSpy = jest.spyOn(requester['auth'], 'getToken');
      tokenSpy.mockImplementation(() => token);
    });

    afterEach(() => {
      requester = undefined as any;
      tokenSpy.mockRestore();
    });

    const jsonResp = 'json';
    const textResp = 'text';
    it.each([
      [true, jsonResp],
      [false, textResp],
    ])(
      'correctly formats a non-wally, listed rpc request with text and json response',
      async (isJSon, result) => {
        global.fetch = jest.fn(
          () =>
            Promise.resolve({
              ok: true,
              status: 200,
              headers: { get: () => (isJSon ? 'application/json' : '') },
              text: () => Promise.resolve(textResp),
              json: () => Promise.resolve(jsonResp),
            }) as any
        );

        const ret = await requester.request({
          method: RPCMethodName.GET_BALANCE,
          params: ['foo', 'bar'],
        } as any);

        expect(ret).toEqual(result);
        expect(global.fetch).toHaveBeenCalledWith(
          `${host}/oauth/wallet/send`,
          expect.objectContaining({
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: `{"method":"${RPCMethodName.GET_BALANCE}","params":["foo","bar"],"clientId":"${clientId}"}`,
          })
        );
      }
    );

    it.each([
      [undefined],
      [{ ok: false }],
      [{ ok: true, status: 300 }],
      [
        {
          ok: true,
          status: 200,
          headers: { get: () => 'application/json' as any },
          json: () => {
            throw new Error();
          },
        },
      ],
      [
        {
          ok: true,
          status: 200,
          headers: { get: () => '' as any },
          text: () => {
            throw new Error();
          },
        },
      ],
    ])('logs an error and rejects when not ok', (resp) => {
      global.fetch = jest.fn(() => Promise.resolve(resp) as any);
      const consoleSpy = jest.spyOn(console, 'error');
      consoleSpy.mockImplementation(() => {});
      expect.assertions(1);
      return requester.request({ method: RPCMethodName.BLOCK_NUMBER }).then(
        () => {
          expect(true).toBe(false);
        },
        () => {
          expect(consoleSpy).toHaveBeenCalled();
        }
      );
    });

    it('warns before requesting an unlisted rpc method', async () => {
      global.fetch = jest.fn(
        () =>
          Promise.resolve({
            ok: true,
            status: 200,
            headers: { get: () => '' as any },
            text: () => 'YEW',
          }) as any
      );
      const consoleSpy = jest.spyOn(console, 'warn');
      consoleSpy.mockImplementation(() => {});
      await requester.request({ method: 'eth_idksomethingwild' as any });
      expect(consoleSpy).toHaveBeenCalledTimes(1);
    });
  });
});
