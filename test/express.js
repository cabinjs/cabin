const test = require('ava');
const express = require('express');
const supertest = require('supertest');

const Cabin = require('../lib');

test.beforeEach.cb(t => {
  const app = express();
  const cabin = new Cabin({ axe: { capture: false } });
  app.use(cabin.middleware);
  t.context.app = app;
  t.context.server = app.listen(() => {
    t.end();
  });
});

test.cb('req.logger.log for express', t => {
  t.context.app.use((req, res) => {
    req.logger.log('hello');
    res.send('ok');
  });
  const request = supertest(t.context.server);
  request.get('/').end(() => t.end());
});

test.cb('req.logger.warn for express', t => {
  t.context.app.use((req, res) => {
    req.logger.warn('hello');
    res.send('ok');
  });
  const request = supertest(t.context.server);
  request.get('/').end(() => t.end());
});
