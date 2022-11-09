const Koa = require('koa');
const Router = require('koa-router');
const requestReceived = require('request-received');
const responseTime = require('koa-better-response-time');
const requestId = require('koa-better-request-id');
const { Signale } = require('signale');
const Cabin = require('..');

const app = new Koa();
const router = new Router();
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
router.get('/', (ctx) => {
  ctx.logger.info('someone visited the home page');
  ctx.body = 'hello world';
});

// this assumes that you are using passport which
// exposes `ctx.logout` to log out the logged in user
router.get('/logout', (ctx) => {
  ctx.logger.warn('Logged out');
  ctx.logout();
  ctx.redirect('/');
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, () => {
  cabin.info('app started');
});
