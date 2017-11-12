const test = require('ava');
const express = require('express');
const supertest = require('supertest');

const Cabin = require('../');

test.cb.beforeEach(t => {
  const app = express();
  const cabin = new Cabin();
  app.use(cabin.middleware);
  t.context.app = app;
  t.context.server = app.listen(() => {
    t.end();
  });
});

test.cb('req.logger for express', t => {
  t.context.app.use((req, res) => {
    t.true(typeof req.logger === 'function');
    req.logger('log', 'hello');
    res.send('ok');
  });
  const request = supertest(t.context.server);
  request.get('/').end(() => t.end());
});

test.cb('req.logger.warn for express', t => {
  t.context.app.use((req, res) => {
    t.true(typeof req.logger.warn === 'function');
    req.logger.warn('hello');
    res.send('ok');
  });
  const request = supertest(t.context.server);
  request.get('/').end(() => t.end());
});
