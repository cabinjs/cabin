const test = require('ava');
const Koa = require('koa');
const supertest = require('supertest');

const Cabin = require('..');

test.cb.beforeEach(t => {
  const app = new Koa();
  const cabin = new Cabin();
  app.use(cabin.middleware);
  t.context.app = app;
  t.context.server = app.listen(() => {
    t.end();
  });
});

test.cb('ctx.logger for koa', t => {
  t.context.app.use(ctx => {
    t.true(typeof ctx.logger === 'function');
    ctx.logger('log', 'hello');
    ctx.body = 'ok';
  });
  const request = supertest(t.context.server);
  request.get('/').end(() => t.end());
});

test.cb('ctx.logger.warn for koa', t => {
  t.context.app.use(ctx => {
    t.true(typeof ctx.logger.warn === 'function');
    ctx.logger.warn('hello');
    ctx.body = 'ok';
  });
  const request = supertest(t.context.server);
  request.get('/').end(() => t.end());
});
