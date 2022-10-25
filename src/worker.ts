interface SharedWorkerGlobalScope {
  onconnect: (event: MessageEvent) => void;
  ports: MessagePort[];
}

const _self: SharedWorkerGlobalScope = self as any;

_self.ports = [];

const broadcast = (e: MessageEvent) => {
  _self.ports.forEach(p => p.postMessage(e.data));
}

_self.onconnect = function (e) {
  const port = e.ports[0];
  _self.ports.push(port);
  port.addEventListener('message', broadcast)
  port.start();
}
