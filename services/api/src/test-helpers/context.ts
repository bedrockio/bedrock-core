/* eslint-disable no-param-reassign, no-return-assign */

import Stream from 'stream';
import Koa from 'koa';

const context = (req = null, res = null, app = null) => {
  const socket = new Stream.Duplex();
  req = Object.assign({ headers: {}, socket }, Stream.Readable.prototype, req);
  res = Object.assign({ _headers: {}, socket }, Stream.Writable.prototype, res);
  req.socket.remoteAddress = req.socket.remoteAddress || '127.0.0.1';
  app = app || new Koa();
  res.getHeader = (k) => res._headers[k.toLowerCase()];
  res.setHeader = (k, v) => (res._headers[k.toLowerCase()] = v);
  res.removeHeader = (k) => delete res._headers[k.toLowerCase()];
  return app.createContext(req, res);
};

export { context };