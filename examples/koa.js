const Koa = require('koa');
const Router = require('koa-router');
const koaConnect = require('koa-connect');
const requestReceived = require('request-received');
const responseTime = require('response-time');
const requestId = require('express-request-id');
const { Signale } = require('signale');
const pino = require('pino')({
  customLevels: {
    log: 30
  }
});
const Cabin = require('..');

const env = process.env.NODE_ENV || 'development';

const app = new Koa();
const router = new Router();
const cabin = new Cabin({
  // (optional: your free API key from https://cabinjs.com)
  // key: 'YOUR-CABIN-API-KEY',
  axe: {
    logger: env === 'production' ? pino : new Signale()
  }
});

// adds request received hrtime and date symbols to request object
// (which is used by Cabin internally to add `request.timestamp` to logs
app.use(requestReceived);

// adds `X-Response-Time` header to responses
app.use(koaConnect(responseTime()));

// adds or re-uses `X-Request-Id` header
app.use(koaConnect(requestId()));

// use the cabin middleware (adds request-based logging and helpers)
app.use(cabin.middleware);

// add your user/session management middleware here (e.g. passport)
// ...

// an example home page route
router.get('/', ctx => {
  ctx.logger.info('someone visited the home page');
  ctx.body = 'hello world';
});

// this assumes that you are using passport which
// exposes `ctx.logout` to log out the logged in user
router.get('/logout', ctx => {
  ctx.logger.warn('Logged out');
  ctx.logout();
  ctx.redirect('/');
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, () => {
  cabin.info('app started');
});
