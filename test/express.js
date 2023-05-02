const test = require('ava');
const _ = require('lodash');
const express = require('express');
const supertest = require('supertest');
const requestReceived = require('request-received');
const responseTime = require('response-time');
const requestId = require('express-request-id');
const Cabin = require('..');

test.beforeEach((t) => {
  const app = express();
  const cabin = new Cabin();
  app.use(requestReceived);
  app.use(responseTime());
  app.use(requestId());
  app.use(cabin.middleware);
  t.context.app = app;
  return new Promise((resolve, reject) => {
    t.context.server = app.listen((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
});

test('should expose a middleware function', (t) => {
  const cabin = new Cabin();
  t.true(_.isFunction(cabin.middleware));
});

test('req.logger.log for express', (t) => {
  t.context.app.use((request_, res) => {
    request_.logger.log('hello');
    res.send('ok');
  });
  const request = supertest(t.context.server);
  return new Promise((resolve, reject) => {
    request.get('/').end((err) => {
      if (err) return reject(err);
      t.pass();
      resolve();
    });
  });
});

test('req.logger.warn for express', (t) => {
  t.context.app.use((request_, res) => {
    request_.logger.warn('hello');
    res.send('ok');
  });
  const request = supertest(t.context.server);
  return new Promise((resolve, reject) => {
    request.get('/').end((err) => {
      if (err) return reject(err);
      t.pass();
      resolve();
    });
  });
});
