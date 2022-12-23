import { MessengerOptions, WorkerMessage } from './types';
export default class Messenger {
    private worker;
    private emitterCallbacks;
    private workerCallbacks;
    constructor({ sharedWorkerUrl, _disableSharedWorker }: MessengerOptions);
    addListener(name: string, cb: (a?: any) => void): void;
    removeListener(name: string, fn: any): void;
    removeAllListeners(name: string): void;
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
    emit(message: string, address?: string): void;
    private connectToSharedWorker;
    handleWorkerMessage(message: WorkerMessage): void;
    onWorkerMessage(message: WorkerMessage, fn: () => void): void;
    sendWorkerMessage(message: WorkerMessage): void;
}
