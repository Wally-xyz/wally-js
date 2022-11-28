'use strict';
const _self = self;
_self.ports = [];
const broadcast = (e) => {
  _self.ports.forEach((p) => p.postMessage(e.data));
};
_self.onconnect = function (e) {
  const port = e.ports[0];
  _self.ports.push(port);
  port.addEventListener('message', broadcast);
  port.start();
};
//# sourceMappingURL=worker.js.map
