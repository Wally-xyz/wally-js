import { EmitterMessage, MessengerOptions, WorkerMessage } from './types';

export default class Messenger {
  private worker;
  private emitterCallbacks: Partial<Record<string, Array<(a?: any) => void>>> =
    {};
  private workerCallbacks: Partial<Record<WorkerMessage, Array<() => void>>> =
    {};

  constructor({ sharedWorkerUrl, _disableSharedWorker }: MessengerOptions) {
    if (!_disableSharedWorker && sharedWorkerUrl && SharedWorker) {
      this.worker = new SharedWorker(sharedWorkerUrl);
      this.connectToSharedWorker();
    }
  }

  public addListener(name: string, cb: (a?: any) => void): void {
    if (!this.emitterCallbacks[name]) {
      this.emitterCallbacks[name] = [];
    }
    this.emitterCallbacks[name]?.push(cb);
  }

  public removeListener(name: string, fn: any): void {
    const idx = this.emitterCallbacks[name]?.indexOf(fn);
    if (idx && idx > -1) {
      this.emitterCallbacks[name]?.splice(idx, 1);
    }
  }

  public removeAllListeners(name: string) {
    this.emitterCallbacks[name] = [];
  }

  /**
   * The function used to call all listeners for a specific messsage.
   * Does NOT remove them, should be removed with a separate `removeListener()`
   * or `removeAllListeners` call. There isn't really a well-defined list of
   * messages to handle, so this is open-ended on purpose.
   * `accountsChanged` is really the big important one used throughout public apps.
   * @param message The name of the message we're emitting
   * @param address [optional] The current wallet address,
   * only used when handling accountsChanged messages.
   */
  public emit(message: string, address?: string): void {
    if (message === EmitterMessage.ACCOUNTS_CHANGED && !address) {
      throw new Error(
        'address not provided for emmitting `accountsChanged` message'
      );
      return;
    }

    this.emitterCallbacks[message]?.forEach((cb) => {
      cb(message === EmitterMessage.ACCOUNTS_CHANGED ? [address] : undefined);
    });
  }

  public connectToSharedWorker(): void {
    if (!this.worker) {
      console.error(
        'SharedWorker not available, falling back to less-than-ideal experience.'
      );
      return;
    }

    this.worker.port.start();
    this.worker.port.onmessage = (e: MessageEvent) => {
      this.handleWorkerMessage(e.data);
    };
  }

  public handleWorkerMessage(message: WorkerMessage): void {
    if (!this.worker) {
      return;
    }
    this.workerCallbacks[message]?.forEach((cb) => cb());
  }

  public onWorkerMessage(message: WorkerMessage, fn: () => void) {
    if (!this.worker) {
      return;
    }
    if (!this.workerCallbacks[message]) {
      this.workerCallbacks[message] = [];
    }
    this.workerCallbacks[message]?.push(fn);
  }

  public sendWorkerMessage(message: WorkerMessage) {
    if (!this.worker) {
      return;
    }
    this.worker.port.postMessage(message);
  }
}
