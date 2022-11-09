const express = require('express');
const requestReceived = require('request-received');
const responseTime = require('response-time');
const requestId = require('express-request-id');
const { Signale } = require('signale');
const Cabin = require('..');

const app = express();
const cabin = new Cabin({
  logger: new Signale()
});

// adds request received hrtime and date symbols to request object
// (which is used by Cabin internally to add `request.timestamp` to logs
app.use(requestReceived);

// adds `X-Response-Time` header to responses
app.use(responseTime());

// adds or re-uses `X-Request-Id` header
app.use(requestId());

// use the cabin middleware (adds request-based logging and helpers)
app.use(cabin.middleware);

// add your user/session management middleware here (e.g. passport)
// ...

// an example home page route
app.get('/', (request, res) => {
  request.logger.info('someone visited the home page');
  res.send('hello world');
});

// this assumes that you are using passport which
// exposes `req.logout` to log out the logged in user
app.get('/logout', (request, res) => {
  request.logger.warn('Logged out');
  request.logout();
  res.redirect('/');
});

app.listen(3000, () => {
  cabin.info('app started');
});
