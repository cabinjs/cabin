const test = require('ava');
const _ = require('lodash');
const Koa = require('koa');
const supertest = require('supertest');
const requestReceived = require('request-received');
const responseTime = require('koa-better-response-time');
const requestId = require('koa-better-request-id');

const Cabin = require('..');

test.beforeEach.cb(t => {
  const app = new Koa();
  const cabin = new Cabin();
  app.use(requestReceived);
  app.use(responseTime());
  app.use(requestId());
  app.use(cabin.middleware);
  t.context.app = app;
  t.context.server = app.listen(() => {
    t.end();
  });
});

test('should expose a middleware function', t => {
  const cabin = new Cabin();
  t.true(_.isFunction(cabin.middleware));
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
