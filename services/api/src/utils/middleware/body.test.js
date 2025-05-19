const Koa = require('koa');
const Router = require('@koa/router');

const bodyMiddleware = require('./body');
const { request } = require('../testing');

const file = __dirname + '/__fixtures__/test.png';

describe('bodyMiddleware', () => {
  it('should be able to send files and data in the same request', async () => {
    // Leaning on supertest and koa here as multipart form
    // data is difficult to send through a node stream.
    const router = new Router();
    router.post('/', (ctx) => {
      const { originalFilename } = ctx.request.files.file;
      ctx.body = {
        ...ctx.request.body,
        originalFilename,
      };
    });

    const app = new Koa();
    app.use(bodyMiddleware());
    app.use(router.routes());

    const response = await request(
      'POST',
      '/',
      {
        foo: 'bar',
      },
      { app, file },
    );
    expect(response.body).toEqual({
      foo: 'bar',
      originalFilename: 'test.png',
    });
  });
});
