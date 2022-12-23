import Messenger from '../src/messenger';
import { EmitterMessage, WorkerMessage } from '../src/types';

describe('Messenger', () => {
  describe('constructor', () => {
    it('creates and connects to a shared worker', () => {
      const sharedWorkerUrl = 'http://foo.bar.org';
      const mockStart = jest.fn();
      SharedWorker = jest.fn(
        () =>
          ({
            port: {
              start: mockStart,
              onmessage: undefined,
            },
          } as any)
      );
      const handleWorkerSpy = jest.spyOn(
        Messenger.prototype,
        'handleWorkerMessage'
      );
      handleWorkerSpy.mockImplementation(jest.fn());
      const messenger = new Messenger({
        sharedWorkerUrl,
      });
      expect(SharedWorker).toHaveBeenCalledWith(sharedWorkerUrl);
      expect(mockStart).toHaveBeenCalled();
      (messenger['worker'] as any)['port']['onmessage']({ data: 'foo' });
      expect(handleWorkerSpy).toHaveBeenCalled();
      handleWorkerSpy.mockRestore();
    });

    it.each([
      [true, '/worker.js', true],
      [false, undefined, true],
      [false, '/worker.js', false],
    ])(
      'does not create a shared worker when disabled: %s, url: %s, or defined: %s',
      (_disableSharedWorker, sharedWorkerUrl, sharedWorkerAvailable) => {
        SharedWorker = sharedWorkerAvailable ? jest.fn() : (undefined as any);
        const messenger = new Messenger({
          sharedWorkerUrl,
          _disableSharedWorker,
        });
        expect(messenger['worker']).toBeUndefined();
      }
    );
  });

  describe('message emitter', () => {
    let messenger: Messenger;

    beforeEach(() => {
      messenger = new Messenger({});
    });

    it('throws an error when emitting accounts changed with no address', () => {
      expect(() =>
        messenger.emit(EmitterMessage.ACCOUNTS_CHANGED)
      ).toThrowError();
    });

    it('emits accounts changed with address', () => {
      const mockFn = jest.fn();
      const address = '0x5432';
      messenger.addListener(EmitterMessage.ACCOUNTS_CHANGED, mockFn);
      messenger.emit(EmitterMessage.ACCOUNTS_CHANGED, address);
      expect(mockFn).toHaveBeenCalledWith([address]);
    });

    it('emits appropriate messages after adding and removing', () => {
      const mockFn1 = jest.fn();
      const mockFn2 = jest.fn();
      const mockFn3 = jest.fn();
      const name1 = 'message1';
      const name2 = 'message2';
      messenger.addListener(name1, mockFn1);
      messenger.addListener(name2, mockFn2);
      messenger.emit(name1);
      expect(mockFn1).toHaveBeenCalledTimes(1);
      expect(mockFn2).not.toHaveBeenCalled();
      messenger.addListener(name2, mockFn3);
      messenger.emit(name2);
      expect(mockFn2).toHaveBeenCalledTimes(1);
      expect(mockFn3).toHaveBeenCalledTimes(1);
      messenger.removeListener(name2, mockFn2);
      messenger.emit(name2);
      expect(mockFn2).toHaveBeenCalledTimes(1);
      expect(mockFn3).toHaveBeenCalledTimes(2);
      messenger.removeAllListeners(name2);
      expect(mockFn2).toHaveBeenCalledTimes(1);
      expect(mockFn3).toHaveBeenCalledTimes(2);
    });
  });

  describe('SharedWorker', () => {
    let messenger: Messenger;
    const mockPortStart = jest.fn();
    const mockPortPost = jest.fn();

    beforeEach(() => {
      SharedWorker = jest.fn(
        () =>
          ({
            port: {
              start: mockPortStart,
              postMessage: mockPortPost,
            },
          } as any)
      );
      messenger = new Messenger({
        sharedWorkerUrl: '/worker.js',
      });
    });

    it('shows console error when trying to connect and no worker', () => {
      SharedWorker = undefined as any;
      const messenger = new Messenger({});
      const consoleSpy = jest.spyOn(console, 'error');
      consoleSpy.mockImplementation(() => {});
      messenger['connectToSharedWorker']();
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('can add listeners', () => {
      const name = WorkerMessage.LOGIN_FAILURE;
      const fn = jest.fn();
      const fn2 = jest.fn();
      messenger.onWorkerMessage(name, fn);
      messenger.onWorkerMessage(name, fn2);
      expect(messenger['workerCallbacks'][name]!.length).toBe(2);
    });

    it('adding does not do anything when no worker', () => {
      SharedWorker = jest.fn(() => undefined as any);
      messenger = new Messenger({});
      const name = WorkerMessage.LOGIN_FAILURE;
      const fn = jest.fn();
      messenger.onWorkerMessage(name, fn);
      expect(messenger['workerCallbacks'][name]).not.toBeDefined();
    });

    it('can send messages', () => {
      const name = WorkerMessage.LOGIN_SUCCESS;
      messenger.sendWorkerMessage(name);
      expect(mockPortPost).toHaveBeenCalledWith(name);
    });

    it('can handle messages', () => {
      const name = WorkerMessage.LOGIN_FAILURE;
      const fn = jest.fn();
      messenger.onWorkerMessage(name, fn);
      messenger.handleWorkerMessage(name);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('handling does nothing when no worker', () => {
      SharedWorker = jest.fn(() => undefined as any);
      messenger = new Messenger({});
      const fn = jest.fn();
      const name = WorkerMessage.LOGIN_FAILURE;
      messenger['workerCallbacks'][name] = [fn];
      messenger.handleWorkerMessage(name);
      expect(fn).not.toHaveBeenCalled();
    });
  });
});
