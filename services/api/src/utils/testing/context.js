import Stream from 'stream';
import Koa from 'koa';

function context(req, res, app) {
  const socket = new Stream.Duplex();
  req = Object.assign({ headers: {}, socket }, Stream.Readable.prototype, req, {
    url: 'http://localhost',
  });
  res = Object.assign({ _headers: {}, socket }, Stream.Writable.prototype, res);
  req.socket.remoteAddress = req.socket.remoteAddress || '127.0.0.1';
  app = app || new Koa();
  res.getHeader = (k) => res._headers[k.toLowerCase()];
  res.setHeader = (k, v) => (res._headers[k.toLowerCase()] = v);
  res.removeHeader = (k) => delete res._headers[k.toLowerCase()];
  return app.createContext(req, res);
}

context.request = (req, res, app) => context(req, res, app).request;

context.response = (req, res, app) => context(req, res, app).response;

export default context;
