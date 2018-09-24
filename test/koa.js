const test = require('ava');
const Koa = require('koa');
const supertest = require('supertest');

const Cabin = require('../lib');

test.beforeEach.cb(t => {
  const app = new Koa();
  const cabin = new Cabin();
  app.use(cabin.middleware);
  t.context.app = app;
  t.context.server = app.listen(() => {
    t.end();
  });
});

test.cb('ctx.logger.log for koa', t => {
  t.context.app.use(ctx => {
    ctx.logger.log('hello');
    ctx.body = 'ok';
  });
  const request = supertest(t.context.server);
  request.get('/').end(() => t.end());
});

test.cb('ctx.logger.warn for koa', t => {
  t.context.app.use(ctx => {
    ctx.logger.warn('hello');
    ctx.body = 'ok';
  });
  const request = supertest(t.context.server);
  request.get('/').end(() => t.end());
});
