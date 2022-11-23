interface SharedWorkerGlobalScope {
    onconnect: (event: MessageEvent) => void;
    ports: MessagePort[];
}
declare const _self: SharedWorkerGlobalScope;
declare const broadcast: (e: MessageEvent) => void;
