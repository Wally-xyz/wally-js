"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
class Messenger {
    constructor({ sharedWorkerUrl, _disableSharedWorker }) {
        this.emitterCallbacks = {};
        this.workerCallbacks = {};
        if (!_disableSharedWorker && sharedWorkerUrl && SharedWorker) {
            this.worker = new SharedWorker(sharedWorkerUrl);
            this.connectToSharedWorker();
        }
    }
    addListener(name, cb) {
        var _a;
        if (!this.emitterCallbacks[name]) {
            this.emitterCallbacks[name] = [];
        }
        (_a = this.emitterCallbacks[name]) === null || _a === void 0 ? void 0 : _a.push(cb);
    }
    removeListener(name, fn) {
        var _a, _b;
        const idx = (_a = this.emitterCallbacks[name]) === null || _a === void 0 ? void 0 : _a.indexOf(fn);
        if (idx && idx > -1) {
            (_b = this.emitterCallbacks[name]) === null || _b === void 0 ? void 0 : _b.splice(idx, 1);
        }
    }
    removeAllListeners(name) {
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
    emit(message, address) {
        var _a;
        if (message === types_1.EmitterMessage.ACCOUNTS_CHANGED && !address) {
            throw new Error('address not provided for emmitting `accountsChanged` message');
            return;
        }
        (_a = this.emitterCallbacks[message]) === null || _a === void 0 ? void 0 : _a.forEach((cb) => {
            cb(message === types_1.EmitterMessage.ACCOUNTS_CHANGED ? [address] : undefined);
        });
    }
    connectToSharedWorker() {
        if (!this.worker) {
            console.error('SharedWorker not available, falling back to less-than-ideal experience.');
            return;
        }
        this.worker.port.start();
        this.worker.port.onmessage = (e) => {
            this.handleWorkerMessage(e.data);
        };
    }
    handleWorkerMessage(message) {
        var _a;
        if (!this.worker) {
            return;
        }
        (_a = this.workerCallbacks[message]) === null || _a === void 0 ? void 0 : _a.forEach((cb) => cb());
    }
    onWorkerMessage(message, fn) {
        var _a;
        if (!this.worker) {
            return;
        }
        if (!this.workerCallbacks[message]) {
            this.workerCallbacks[message] = [];
        }
        (_a = this.workerCallbacks[message]) === null || _a === void 0 ? void 0 : _a.push(fn);
    }
    sendWorkerMessage(message) {
        if (!this.worker) {
            return;
        }
        this.worker.port.postMessage(message);
    }
}
exports.default = Messenger;
//# sourceMappingURL=messenger.js.map