<h1 align="center">
  <a href="http://cabinjs.com"><img src="https://d1i8ikybhfrv4r.cloudfront.net/cabin-animated.gif" alt="cabin" /></a>
</h1>
<div align="center">
  <a href="https://slack.crocodilejs.com"><img src="https://slack.crocodilejs.com/badge.svg" alt="chat" /></a>
  <a href="https://travis-ci.org/cabinjs/cabin"><img src="https://travis-ci.org/cabinjs/cabin.svg?branch=master" alt="build status" /></a>
  <a href="https://codecov.io/github/cabinjs/cabin"><img src="https://img.shields.io/codecov/c/github/cabinjs/cabin/master.svg" alt="code coverage" /></a>
  <a href="https://github.com/sindresorhus/xo"><img src="https://img.shields.io/badge/code_style-XO-5ed9c7.svg" alt="code style" /></a>
  <a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/styled_with-prettier-ff69b4.svg" alt="styled with prettier" /></a>
  <a href="https://lass.js.org"><img src="https://img.shields.io/badge/made_with-lass-95CC28.svg" alt="made with lass" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/cabinjs/cabin.svg" alt="license" /></a>
</div>
<br />
<div align="center">
  Cabin is the best <a href="https://en.wikipedia.org/wiki/JavaScript" target="_blank">JavaScript</a> and <a href="https://nodejs.org" target="_blank">Node.js</a> <a href="https://en.wikipedia.org/wiki/Logging_as_a_service" target="_blank">logging service</a> and logging <a href="https://www.npmjs.com/package/cabin" target="_blank">npm package</a>
  <br />
  <small>Supports Node v6.4+, Browsers (IE 10+), <a href="https://expressjs.com" target="_blank">Express</a>, <a href="https://koajs.com" target="_blank">Koa</a>, and <a href="https://lad.js.org" target="_blank">Lad</a></small>
</div>
<hr />
<div align="center">
  Cabin is a drop-in replacement and the best alternative to <a href="https://sentry.io" target="_blank">Sentry</a>, <a href="https://timber.io/" target="_blank">Timber</a>, <a href="https://airbrake.io/" target="_blank">Airbrake</a>, <a href="https://papertrailapp.com/" target="_blank">Papertrail</a>, <a href="https://www.loggly.com/" target="_blank">Loggly</a>, <a href="https://www.bugsnag.com/" target="_blank">Bugsnag</a>, or <code>&lt;service&gt;</code>
</div>
<hr />
<div align="center">:heart: Love this project? Support <a href="https://github.com/niftylettuce" target="_blank">@niftylettuce's</a> <a href="https://en.wikipedia.org/wiki/Free_and_open-source_software" target="_blank">FOSS</a> on <a href="https://patreon.com/niftylettuce" target="_blank">Patreon</a> or <a href="https://paypal.me/niftylettuce">PayPal</a> :unicorn:</div>


## Table of Contents

* [Quick Start](#quick-start)
* [Features](#features)
  * [Security, Privacy, and Business Focused](#security-privacy-and-business-focused)
  * [Reduce Disk Storage Costs](#reduce-disk-storage-costs)
  * [Cross-Platform and Cross-Browser Compatible](#cross-platform-and-cross-browser-compatible)
  * [Integrate with Slack Using Custom Logging Hooks](#integrate-with-slack-using-custom-logging-hooks)
  * [Bring Your Own Logger ("BYOL")](#bring-your-own-logger-byol)
  * [Drop-in Replacement and Alternative to Bunyan](#drop-in-replacement-and-alternative-to-bunyan)
  * [Save Time With Easy Debugging](#save-time-with-easy-debugging)
* [Install](#install)
* [Usage](#usage)
  * [Logging](#logging)
  * [Route Middleware](#route-middleware)
  * [Node](#node)
  * [Browser](#browser)
  * [Automatic Request Logging](#automatic-request-logging)
  * [Stack Traces and Error Handling](#stack-traces-and-error-handling)
* [Display Metadata and Stack Traces](#display-metadata-and-stack-traces)
  * [Show/Hide Metadata](#showhide-metadata)
  * [Show/Hide Stack Traces](#showhide-stack-traces)
* [Options](#options)
* [Metadata](#metadata)
* [Related](#related)
* [Contributors](#contributors)
* [Trademark Notice](#trademark-notice)
* [License](#license)


## Quick Start

```sh
npm install cabin
```

```js
const express = require('express');
const Cabin = require('cabin');     // <-- step 1
const app = express();
const cabin = new Cabin();          // <-- step 2
app.use(cabin.middleware);          // <-- step 3
app.listen(3000);
```

> <small>See our **[Usage section below](#usage)** for a much more detailed and feature-rich example setup.</small>


## Features

### Security, Privacy, and Business Focused

Cabin will automatically detect and mask the following list of extremely sensitive types of data in your logs:

* [1600+ Sensitive Field Names][sensitive-fields]
* Credit Card Numbers<sup>\*</sup>
* [BasicAuth Headers][basicauth-headers]
* Social Security Numbers
* [JSON Web Tokens ("JWT")][jwt-tokens]
* API Keys, CSRF Tokens, and Stripe Tokens
* Passwords, Salts, and Hashes
* Bank Account Numbers and Bank Routing Numbers

> <small><sup>\*</sup>Credit card numbers from the following providers are automatically detected and masked: Visa, Mastercard, American Express, Diners Club, Discover, JCB, UnionPay, Maestro, Mir, Elo, Hiper, Hipercard</small>

### Reduce Disk Storage Costs

Reduce your disk storage costs through Cabin's automatic conversion of Streams, Buffers, and ArrayBuffers to simplified, descriptive-only objects that otherwise would be unreadable (and obviously pollute your log files and disk storage).

> Before:

```json
{
  "request": {
    "body": {
      "file": {
        "type": "Buffer",
        "data": [
          76,
          111,
          114,
          101,
          109,
          32,
          105,
          112,
          115,
          117,
          109,
          32,
          100,
          111,
          108,
          111,
          114,
          32,
          115,
          105,
          116,
          '...'
        ]
      }
    }
  }
}
```

> After

```json
{
  "request": {
    "body": {
      "file": {
        "type": "Buffer",
        "byteLength": 2787
      }
    }
  }
}
```

### Cross-Platform and Cross-Browser Compatible

Cabin works with the most popular Node.js HTTP frameworks (e.g. [Express][] and [Koa][]), request body handling packages (e.g. [multer][] and [body-parser][]), and the [passport][] authentication framework.

It supports **Node v6.4+** and **IE 10+** out of the box, and its browser-ready bundle **is only 39 KB** (minified and gzipped).

```sh
npx browserslist
```

```sh
and_chr 74
and_ff 66
and_qq 1.2
and_uc 11.8
android 67
baidu 7.12
bb 10
bb 7
chrome 74
chrome 73
chrome 72
edge 18
edge 17
firefox 66
firefox 65
ie 11
ie 10
ie_mob 11
ie_mob 10
ios_saf 12.2
ios_saf 12.0-12.1
kaios 2.5
op_mini all
op_mob 46
op_mob 12.1
opera 58
opera 57
safari 12.1
safari 12
samsung 9.2
samsung 8.2
```

### Integrate with Slack Using Custom Logging Hooks

[Axe][] is the underlying logging add-on that allows you to record, store, back-up, and customize your log handling over HTTP or with your own custom logic.

You will find an entire example for logging errors (and more) to your Slack channel under its section [Send Logs To Slack](https://github.com/cabinjs/axe#send-logs-to-slack).

### Bring Your Own Logger ("BYOL")

Cabin was built by an expert based off best practices; over a decade of experience in logging and application development – and most importantly from their agony with existing tools, services, packages, and platforms.

It was made to be both a **simple and quick drop-in replacement** for existing services.  **You can even bring your own logger!**  Want to use [Axe][], [pino][], [signale][], [morgan][], [bunyan][], [winston][], or another logger?  No problem.

### Drop-in Replacement and Alternative to Bunyan

We built this with Bunyan-style compatibility – this means you won't have to change your logging argument style from `log(meta, message)` to `log(message, meta)`; we automatically detect Bunyan style (Metadata first, message second) and flip the order for you.

As of v6.1.1 we have added support for Bunyan style `(meta, message, [, ...args])` usage (e.g. `logger.info({ some: 'obj' }, 'message with format specifiers %s and %d', 'foobar', 100)`), prior to v6.1.1 we only supported `(meta, message)` usage.

### Save Time With Easy Debugging

No need for rubber duck debugging – Cabin makes everything transparent at a glance.

Rich metadata is automatically added to your logs, so that you can easily record, analyze, and detect user behavior and application events, errors, and more:

> Example Application:

```js
const express = require('express');
const Cabin = require('cabin');
const multer = require('multer');
const requestReceived = require('request-received');
const responseTime = require('response-time');
const requestId = require('express-request-id');

const app = express();
const cabin = new Cabin();
const upload = multer();

app.use(requestReceived);
app.use(responseTime());
app.use(requestId());
app.use(cabin.middleware);

app.post(
  '/',
  upload.fields([
    {
      name: 'avatar',
      maxCount: 1
    },
    {
      name: 'boop',
      maxCount: 2
    }
  ]),
  (req, res) => {
    req.logger.info('visited home page');
    res.send('hello world');
  }
});

app.listen(3000);
```

> Example Console Output (using [Signale][]):

```sh
ℹ  info      visited home page { id: '5d1b9e484ebd2adcdfd29bf4',
  timestamp: '2019-07-02T18:11:20.000Z',
  request:
   { method: 'POST',
     query: { foo: 'bar', beep: 'boop' },
     headers:
      { host: '127.0.0.1:55370',
        'accept-encoding': 'gzip, deflate',
        'user-agent': 'node-superagent/3.8.3',
        authorization: 'Basic ********************',
        accept: 'application/json',
        cookie: 'foo=bar;beep=boop',
        'content-type':
         'multipart/form-data; boundary=--------------------------028474125060986605281677',
        'content-length': '1599',
        connection: 'close' },
     cookies: { foo: 'bar', beep: 'boop' },
     url: '/?foo=bar&beep=boop',
     body:
      '{"product_id":"5d0350ef2ca74d11ee6e4f00","name":"nifty","surname":"lettuce","bank_account_number":"**********","card":{"number":"****-****-****-****"},"stripe_token":"***************","favorite_color":"green"}',
     timestamp: '2019-07-02T18:11:20.331Z',
     id: '33afc3c5-1571-4249-b024-876b6f687b65',
     http_version: '1.1',
     files:
      '{"avatar":[{"fieldName":"avatar","originalName":"avatar.png","clientReportedMimeType":"image/png","clientReportedFileExtension":".png","path":"/var/folders/t_/4vd3m1h92zsc953ll8r_4s_h0000gn/T/N6NE8A8","size":216,"detectedMimeType":"image/png","detectedFileExtension":".png","stream":{"type":"Stream"}}],"boop":[{"fieldName":"boop","originalName":"boop-1.txt","clientReportedMimeType":"text/plain","clientReportedFileExtension":".txt","path":"/var/folders/t_/4vd3m1h92zsc953ll8r_4s_h0000gn/T/PCB8YTR","size":7,"detectedMimeType":{},"detectedFileExtension":"","stream":{"type":"Stream"}},{"fieldName":"boop","originalName":"boop-2.txt","clientReportedMimeType":"text/plain","clientReportedFileExtension":".txt","path":"/var/folders/t_/4vd3m1h92zsc953ll8r_4s_h0000gn/T/EKMAKXR","size":7,"detectedMimeType":{},"detectedFileExtension":"","stream":{"type":"Stream"}}]}' },
  user: { ip_address: '::ffff:127.0.0.1' },
  duration: 1.741299,
  app:
   { name: 'parse-request',
     version: '2.0.1',
     node: 'v10.15.3',
     hash: '75783ef9d0a9c1c71f83ee352754a14ead0a3138',
     tag: 'v2.0.1',
     environment: 'test',
     hostname: 'jacks-MacBook-Pro.local',
     pid: 56543 } }
ℹ  info      ::ffff:127.0.0.1 user POST /?foo=bar&beep=boop HTTP/1.1 200 1951 - 67.819 ms { id: '5d1b9e484ebd2adcdfd29bf5',
  timestamp: '2019-07-02T18:11:20.000Z',
  request:
   { method: 'POST',
     query: { foo: 'bar', beep: 'boop' },
     headers:
      { host: '127.0.0.1:55370',
        'accept-encoding': 'gzip, deflate',
        'user-agent': 'node-superagent/3.8.3',
        authorization: 'Basic ********************',
        accept: 'application/json',
        cookie: 'foo=bar;beep=boop',
        'content-type':
         'multipart/form-data; boundary=--------------------------028474125060986605281677',
        'content-length': '1599',
        connection: 'close' },
     cookies: { foo: 'bar', beep: 'boop' },
     url: '/?foo=bar&beep=boop',
     body:
      '{"product_id":"5d0350ef2ca74d11ee6e4f00","name":"nifty","surname":"lettuce","bank_account_number":"**********","card":{"number":"****-****-****-****"},"stripe_token":"***************","favorite_color":"green"}',
     timestamp: '2019-07-02T18:11:20.331Z',
     id: '33afc3c5-1571-4249-b024-876b6f687b65',
     http_version: '1.1',
     files:
      '{"avatar":[{"fieldName":"avatar","originalName":"avatar.png","clientReportedMimeType":"image/png","clientReportedFileExtension":".png","path":"/var/folders/t_/4vd3m1h92zsc953ll8r_4s_h0000gn/T/N6NE8A8","size":216,"detectedMimeType":"image/png","detectedFileExtension":".png","stream":{"type":"Stream"}}],"boop":[{"fieldName":"boop","originalName":"boop-1.txt","clientReportedMimeType":"text/plain","clientReportedFileExtension":".txt","path":"/var/folders/t_/4vd3m1h92zsc953ll8r_4s_h0000gn/T/PCB8YTR","size":7,"detectedMimeType":{},"detectedFileExtension":"","stream":{"type":"Stream"}},{"fieldName":"boop","originalName":"boop-2.txt","clientReportedMimeType":"text/plain","clientReportedFileExtension":".txt","path":"/var/folders/t_/4vd3m1h92zsc953ll8r_4s_h0000gn/T/EKMAKXR","size":7,"detectedMimeType":{},"detectedFileExtension":"","stream":{"type":"Stream"}}]}' },
  user: { ip_address: '::ffff:127.0.0.1' },
  response:
   { headers:
      { 'x-request-id': '33afc3c5-1571-4249-b024-876b6f687b65',
        'content-type': 'application/json; charset=utf-8',
        'content-length': '1951',
        'x-response-time': '67.819ms',
        date: 'Tue, 02 Jul 2019 18:11:20 GMT',
        connection: 'close' },
     http_version: '1.1',
     status_code: 200,
     reason_phrase: 'OK',
     timestamp: '2019-07-02T18:11:20.000Z',
     duration: 67.819 },
  duration: 2.320237,
  app:
   { name: 'parse-request',
     version: '2.0.1',
     node: 'v10.15.3',
     hash: '75783ef9d0a9c1c71f83ee352754a14ead0a3138',
     tag: 'v2.0.1',
     environment: 'test',
     hostname: 'jacks-MacBook-Pro.local',
     pid: 56543 } }
```


## Install

[npm][]:

```sh
npm install cabin
```

[yarn][]:

```sh
yarn add cabin
```


## Usage

> Don't want to configure this yourself? You can simply use [Lad][] which has this all built-in for you.

### Logging

```js
const Cabin = require('cabin');
const cabin = new Cabin();
cabin.info('hello world');
cabin.error(new Error('oops!'));
```

Each log level should be invoked with two arguments `message` and `meta`.

* `message` (String or Error) - this should be either a String or an Error object
* `meta` (Object or Error) - this is optional and will automatically be set to an object that inherits properties from `config.meta` and requests parsed.  If this is an Error object, then this error will be automatically added and transformed to the `meta` object's `meta.err` property (e.g. `{ err: <Error>, ... }`)

### Route Middleware

```js
app.use(cabin.middleware);
```

See either the [Node](#node) or [Browser](#browser) instructions below for further route middleware usage and proper setup.

### Node

> The examples below show how to use Cabin in combination with [Axe][], [Signale][] logging utility (for development), [Pino][] logging utility (for production), and how to add an accurate `X-Response-Time` response time metric to your logs and response headers automatically.

#### Koa

> Don't want to configure this yourself? We **highly recommend** to use [Lad][] instead of configuring this yourself as it has all of this pre-configured for you with best-practices.  However if you already have an existing [Koa][] based project the example below will sufficiently serve as a guide for implementation.

1. Install required and recommended dependencies:

   ```sh
   npm install koa cabin signale pino request-received response-time koa-connect express-request-id
   ```

2. Implement the example code below ([also found here](examples/koa.js)):

   ```js
   const Koa = require('koa');
   const Cabin = require('cabin');
   const Router = require('koa-router');
   const koaConnect = require('koa-connect');
   const requestReceived = require('request-received');
   const responseTime = require('response-time');
   const requestId = require('express-request-id');
   const { Signale } = require('signale');
   const pino = require('pino')({
     customLevels: {
       log: 30
     },
     hooks: {
       // <https://github.com/pinojs/pino/blob/master/docs/api.md#logmethod>
       logMethod(inputArgs, method) {
         return method.call(this, {
           // <https://github.com/pinojs/pino/issues/854>
           // message: inputArgs[0],
           msg: inputArgs[0],
           meta: inputArgs[1]
         });
       }
     }
   });

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
     ctx.logger.info('visited home page');
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
   ```

3. See [Koa convenience methods below](#koa-1) for helper utilities you can use while writing code.

#### Express

1. Install required and recommended dependencies:

   ```sh
   npm install express cabin signale pino request-received response-time express-request-id
   ```

2. Implement the example code below ([also found here](examples/express.js)):

   ```js
   const express = require('express');
   const Cabin = require('cabin');
   const requestReceived = require('request-received');
   const responseTime = require('response-time');
   const requestId = require('express-request-id');
   const { Signale } = require('signale');
   const pino = require('pino')({
     customLevels: {
       log: 30
     },
     hooks: {
       // <https://github.com/pinojs/pino/blob/master/docs/api.md#logmethod>
       logMethod(inputArgs, method) {
         return method.call(this, {
           // <https://github.com/pinojs/pino/issues/854>
           // message: inputArgs[0],
           msg: inputArgs[0],
           meta: inputArgs[1]
         });
       }
     }
   });

   const env = process.env.NODE_ENV || 'development';

   const app = express();
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
   app.use(responseTime());

   // adds or re-uses `X-Request-Id` header
   app.use(requestId());

   // use the cabin middleware (adds request-based logging and helpers)
   app.use(cabin.middleware);

   // add your user/session management middleware here (e.g. passport)
   // ...

   // an example home page route
   app.get('/', (req, res) => {
     req.logger.info('visited home page');
     res.send('hello world');
   });

   // this assumes that you are using passport which
   // exposes `req.logout` to log out the logged in user
   app.get('/logout', (req, res) => {
     req.logger.warn('logged out');
     req.logout();
     res.redirect('/');
   });

   app.listen(3000, () => {
     cabin.info('app started');
   });
   ```

3. See [Express convenience methods below](#express-1) for helper utilities you can use while writing code.

#### Convenience Methods

In order to easily interact and use the `logger` utility function exposed by `app.use(cabin.middleware)`, we expose convenient helper methods in Express and Koa:

##### Express

* `req.log`
* `req.logger`
* `res.log`
* `res.logger`

##### Koa

* `ctx.log`
* `ctx.logger`
* `ctx.request.log`
* `ctx.request.logger`
* `ctx.response.log`
* `ctx.response.logger`

### Browser

#### VanillaJS

This is the solution for you if you're just using `<script>` tags everywhere!

```html
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6,es7,Map,Map.prototype,Math.sign,Promise,Reflect,Symbol,Symbol.iterator,Symbol.prototype,Symbol.toPrimitive,Symbol.toStringTag,Uint32Array,window.crypto,Array.from,Object.getOwnPropertySymbols,Object.assign"></script>
<script src="https://unpkg.com/cabin"></script>
<script type="text/javascript">
  (function() {
    var cabin = new Cabin({ key: 'YOUR-CABIN-API-KEY', capture: true });
    cabin.setUser({
      id: '1',
      email: 'niftylettuce@gmail.com',
      full_name: 'niftylettuce'
    });
    cabin.info('viewed docs');
  })();
</script>
```

##### Required Browser Features

We recommend using <https://polyfill.io> (specifically with the bundle mentioned in [VanillaJS](#vanillajs) above):

```html
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6,es7,Map,Map.prototype,Math.sign,Promise,Reflect,Symbol,Symbol.iterator,Symbol.prototype,Symbol.toPrimitive,Symbol.toStringTag,Uint32Array,window.crypto,Array.from,Object.getOwnPropertySymbols,Object.assign"></script>
```

* Map is not supported in IE 10
* Map.prototype() is not supported in IE 10
* Math.sign() is not supported in IE 10
* Promise is not supported in Opera Mobile 12.1, Opera Mini all, IE Mobile 10, IE 10, Blackberry Browser 7
* Reflect is not supported in IE 10
* Symbol is not supported in IE 10
* Symbol.iterator() is not supported in IE 10
* Symbol.prototype() is not supported in IE 10
* Symbol.toPrimitive() is not supported in IE 10
* Symbol.toStringTag() is not supported in IE 10
* Uint32Array is not supported in IE Mobile 10, IE 10, Blackberry Browser 7
* window.crypto() is not supported in IE 10
* Array.from() is not supported in IE 10
* Object.getOwnPropertySymbols() is not supported in IE 10
* Object.assign() is not supported in IE 10

#### Bundler

This assumes you are using [browserify][], [webpack][], [rollup][], or another bundler.

```js
const Cabin = require('cabin');

const cabin = new Cabin({ key: 'YOUR-CABIN-API-KEY' });

cabin.setUser({
  id: '1',
  email: 'niftylettuce@gmail.com',
  full_name: 'niftylettuce'
});

cabin.info('viewed docs');
```

### Automatic Request Logging

#### Server

For server-side logging of requests, the Cabin middleware `cabin.middleware` will automatically log requests for you upon completion.  Just make sure you are using `express-request-id` middleware like in the examples above in order for the `X-Request-Id` header to be set (and re-used if already exists, e.g. generated from client side as in below).  If you're using Koa make sure to wrap with `koaConnect` as shown in the examples above.

#### Browser

**We strongly recommend that you implement one of the following code snippets with [xhook][] (for either VanillaJS or Bundler approaches) so that all your XHR requests have a `X-Request-Id` automatically added (which in turn ensures both client and server have matching request ID's).  Imagine how awesome your logs will be when you can see the full trace starting with the client!**

##### HTML

```html
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6,es7,Map,Map.prototype,Math.sign,Promise,Reflect,Symbol,Symbol.iterator,Symbol.prototype,Symbol.toPrimitive,Symbol.toStringTag,Uint32Array,window.crypto,Array.from,Object.getOwnPropertySymbols,Object.assign"></script>
<script src="https://unpkg.com/xhook"></script>
<script src="https://unpkg.com/cabin"></script>
<script src="https://unpkg.com/parse-request"></script>
<script src="https://unpkg.com/cuid"></script>
<script>
  (function() {
    var cabin = new Cabin({ key: 'YOUR-CABIN-API-KEY', capture: true });
    cabin.setUser({
      id: '1',
      email: 'niftylettuce@gmail.com',
      full_name: 'niftylettuce'
    });
    xhook.before(function(req) {
      if (typeof req.headers !== 'object') req.headers = {};

      if (!req.headers['X-Request-Id'])
        req.headers['X-Request-Id'] = cuid();

      if (!req.headers['User-Agent'])
        req.headers['User-Agent'] = window.navigator.userAgent;

      if (!req.headers['Referer'])
        req.headers['Referer'] = window.document.referrer;

      if (!req.headers['Cookie'])
        req.headers['Cookie'] = window.document.cookie;

      cabin.info('xhr', parseRequest({ req: req }));
    });
  })();
</script>
```

##### Pug

> You can do a similar approach with React, EJS, or another templating language.

```pug
script(src='https://polyfill.io/v3/polyfill.min.js?features=es6,es7,Map,Map.prototype,Math.sign,Promise,Reflect,Symbol,Symbol.iterator,Symbol.prototype,Symbol.toPrimitive,Symbol.toStringTag,Uint32Array,window.crypto,Array.from,Object.getOwnPropertySymbols,Object.assign')
script(src='https://unpkg.com/xhook')
script(src='https://unpkg.com/cabin')
script(src='https://unpkg.com/parse-request')
script(src='https://unpkg.com/cuid')
script.
  (function() {
    var cabin = new Cabin({ key: 'YOUR-CABIN-API-KEY', capture: true });
    cabin.setUser({
      id: '1',
      email: 'niftylettuce@gmail.com',
      full_name: 'niftylettuce'
    });
    xhook.before(function(req) {
      if (typeof req.headers !== 'object') req.headers = {};

      if (!req.headers['X-Request-Id'])
        req.headers['X-Request-Id'] = cuid();

      if (!req.headers['X-Request-Id'])
        req.headers['X-Request-Id'] = cuid();

      if (!req.headers['User-Agent'])
        req.headers['User-Agent'] = window.navigator.userAgent;

      if (!req.headers['Referer'])
        req.headers['Referer'] = window.document.referrer;

      if (!req.headers['Cookie'])
        req.headers['Cookie'] = window.document.cookie;

      cabin.info('xhr', parseRequest({ req: req }));
    });
  })();
```

##### Bundler

[npm][]:

```sh
npm install cabin xhook cuid
```

[yarn][]:

```sh
yarn add cabin xhook cuid
```

```js
const Cabin = require('cabin');
const xhook = require('xhook');
const parseRequest = require('parse-request');
const cuid = require('cuid');

const cabin = new Cabin({ key: 'YOUR-CABIN-API-KEY', capture: true });

cabin.setUser({
  id: '1',
  email: 'niftylettuce@gmail.com',
  full_name: 'niftylettuce'
});

xhook.before(req => {
  if (typeof req.headers !== 'object') req.headers = {};

  if (!req.headers['X-Request-Id'])
    req.headers['X-Request-Id'] = cuid();

  //
  // NOTE: you may want to add User-Agent, Referer, and Cookie (see above)
  //

  cabin.info('xhr', parseRequest({ req: req }));
});
```

### Stack Traces and Error Handling

We leave it up to you to decide how you wish to handle stack traces and errors, but we've documented our approaches for Node and Browser environments below.

#### Node

If you're using [Lad][], then you don't need to worry about error handling, as it's built-in (complete with graceful reloading, even for database connections).

However you can otherwise use a tool such as [uncaught][] to listen for errors, or bind purely to `process` events emitted as shown below:

```js
const Cabin = require('cabin');

const cabin = new Cabin({ key: 'YOUR-CABIN-API-KEY' });

process.on('uncaughtException', err => {
  cabin.error(err);
  process.exit(1);
});

process.on('unhandledRejection', err => {
  cabin.error(err);
});
```

#### Browser

Since cross-browser support is very limited and unstandardized for errors and stack traces, we highly recommend to use [StackTrace](#stacktrace).

##### StackTrace

We recommend to use [StackTrace][] instead of [TraceKit][tracekit] as it is a more modern alternative and provides much similarity between your Browser and your Node errors (stackframes are basically similar to representations in Gecko and V8, aka the ones you get with Node).

It does require you to have a polyfill if you're using it in the browser (only if you're supporting browsers that don't support standardized Promises/JSON).  You'll basically need `es6-promise` and `json3` polyfills for browsers you wish to support that don't have them.  The example below shows you how to polyfill, don't worry!  You can reference Caniuse data on [Promises][] and [JSON][] respectively if you need.

The example below demonstrates using StackTrace with [uncaught][] to catch global errors below, but note that [uncaught][] only supports IE11+.

If you're curious why it won't work in IE11, please see this [great documentation on JavaScript errors cross-browser here](https://github.com/mknichel/javascript-errors#windowonerror) - in particular the section on "No Error object provided".

```html
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6,es7,Map,Map.prototype,Math.sign,Promise,Reflect,Symbol,Symbol.iterator,Symbol.prototype,Symbol.toPrimitive,Symbol.toStringTag,Uint32Array,window.crypto,Array.from,Object.getOwnPropertySymbols,Object.assign"></script>
<script src="https://unpkg.com/stackframe"></script>
<script src="https://unpkg.com/stacktrace-js"></script>
<!-- Use this instead of the above if you need to polyfill for IE11 support -->
<!-- <script src="https://unpkg.com/stacktrace-js/dist/stacktrace-with-promises-and-json-polyfills.js"></script> -->
<script src="https://unpkg.com/uncaught"></script>
<script src="https://unpkg.com/cabin"></script>
<script src="https://unpkg.com/prepare-stack-trace"></script>

<script type="text/javascript">
  (function() {
    //
    // Sourced from the StackTrace example from CabinJS docs
    // <https://github.com/cabinjs/cabin#stacktrace>
    //
    var cabin = new Cabin({ key: 'YOUR-CABIN-API-KEY' });

    // Use cabin globally in your app (instead of `console`)
    window.cabin = cabin;

    // Bind event listeners
    uncaught.start();
    uncaught.addListener(function(err, event) {
      if (!err) {
        if (typeof ErrorEvent === 'function' && event instanceof ErrorEvent)
          return cabin.error(event.message, { event: event });
        cabin.error({ event: event });
        return;
      }
      // this will transform the error's `stack` property
      // to be consistently similar to Gecko and V8 stackframes
      StackTrace.fromError(err)
        .then(function(stackframes) {
          err.stack = prepareStackTrace(err, stackframes);
          cabin.error(err);
        })
        .catch(function(err2) {
          cabin.error(err);
          cabin.error(err2);
        });
    });
  })();
</script>
```


## Display Metadata and Stack Traces

Under the hood, Cabin uses [Axe][] which provides us with several options, including one to show metadata (e.g. request headers, body, and user) and another to show stack traces for errors.

You can pass these options through the `axe` option (see [Options](#options) below), or you could pass environment flags when you need to.

**By default, [Axe][] does not output any metadata and only outputs stack traces in non-production environments.**

### Show/Hide Metadata

To hide metadata, pass a falsey value for the process environment variable `SHOW_META`.

> (e.g. `SHOW_META=0` or `SHOW_META=false` before running your script, such as `SHOW_META=false node app`).

Similarly if you pass a truthy value of `1` or `true` it will show metadata (which is the default behavior).

### Show/Hide Stack Traces

To hide stack traces, pass a falsey value for the process environment variable `SHOW_STACK`.

> (e.g. `SHOW_STACK=0` or `SHOW_STACK=false` before running your script, such as `SHOW_STACK=false node app`).

Similarly if you pass a truthy value of `1` or `true` it will show metadata (which is the default behavior).


## Options

* `key` (String) - defaults to an empty string, **this is where you put your Cabin API key**, which you can get for free at [Cabin][]
* `capture` (Boolean) - defaults to `false` in browser (all environments) and server-side (non-production only) environments, whether or not to `POST` logs to the endpoint (see [Axe][] docs for more info)
* `axe` (Object) - defaults to an empty Object `{}`, but you can pass options here for [Axe][]
* `logger` (Object) - if you have a custom logger you wish to use instead of [Axe][], but note that Axe accepts a `logger` option, so you should use that instead, see [Axe][] docs for more info
* `meta` (Object) - defaults to an empty object - this will get passed as metadata (e.g. you could set a custom `meta.user` object here for every request)
* `parseRequest` (Object) - defaults to an empty object, which means it will use the defaults from [parse-request][] (see [Metadata](#metadata) below)
* `errorProps` (Array) - a list of properties to cherry-pick from the error object parsed out of err thanks to [parse-err][] (by default all properties are returned; even non-enumerable ones and ones on the prototype object) (see [Metadata](#metadata) below)
* `message` (Function) - inspired by [morgan][], and defaults to a [dev-friendly format](https://github.com/expressjs/morgan#short) (or if in production mode, then it uses a [standard Apache common log format][apache-clf])). – when requests finish, it will utilize `logger` to output an error, warn, or info level log based off the status code, and this function is used to determine the string sent to the logger.  It accepts one argument `options`, which is comprised of `options.level`, `options.req`, `options.res`, and optionally (if and only if Koa) `options.ctx`.  It is required that this function return a String.  See [src/message.js](src/message.js) for the default message function.  Note that both dev-friendly and Apache common log formats are stripped of basic auth lines for obvious security reasons.


## Metadata

We use the package [parse-request][] to parse the request metadata for you autoamaticaly.

Here's an example of a parsed metadata object:

```js
{
  request: {
    method: 'POST',
    query: {
      foo: 'bar',
      beep: 'boop'
    },
    headers: {
      host: '127.0.0.1:63955',
      'accept-encoding': 'gzip, deflate',
      'user-agent': 'node-superagent/3.8.3',
      authorization: 'Basic ********************',
      accept: 'application/json',
      cookie: 'foo=bar;beep=boop',
      'content-type': 'multipart/form-data; boundary=--------------------------930511303948232291410214',
      'content-length': '1599',
      connection: 'close'
    },
    cookies: {
      foo: 'bar',
      beep: 'boop'
    },
    body: '{"product_id":"5d0350ef2ca74d11ee6e4f00","name":"nifty","surname":"lettuce","bank_account_number":"1234567890","card":{"number":"****-****-****-****"},"stripe_token":"***************","favorite_color":"green"}',
    url: '/?foo=bar&beep=boop',
    timestamp: '2019-06-14T07:46:55.568Z',
    id: 'fd6225ed-8db0-4862-8566-0c0ad6f4c7c9',
    http_version: '1.1',
    files: '{"avatar":[{"fieldname":"avatar","originalname":"avatar.png","encoding":"7bit","mimetype":"image/png","buffer":{"type":"Buffer","byteLength":216},"size":216}],"boop":[{"fieldname":"boop","originalname":"boop-1.txt","encoding":"7bit","mimetype":"text/plain","buffer":{"type":"Buffer","byteLength":7},"size":7},{"fieldname":"boop","originalname":"boop-2.txt","encoding":"7bit","mimetype":"text/plain","buffer":{"type":"Buffer","byteLength":7},"size":7}]}'
  },
  user: {
    ip_address: '::ffff:127.0.0.1'
  },
  id: '5d0350ef2ca74d11ee6e4f01',
  timestamp: '2019-06-14T07:46:55.000Z',
  duration: 6.651317
}
```


## Related

* [forwardemail][] - Free, encrypted, and open-source email forwarding service for custom domains
* [lad][] - Scaffold a [Koa][] webapp and API framework for [Node.js][node]
* [koa-better-error-handler][] - A better error-handler for Lad and Koa. Makes `ctx.throw` awesome!
* [axe][] - Logging utility for Node and Browser environments. Chop up your logs!
* [lass][] - Scaffold a modern boilerplate for [Node.js][node]
* [lipo][] - Free image manipulation API service built on top of [Sharp][]


## Contributors

| Name           | Website                    |
| -------------- | -------------------------- |
| **Nick Baugh** | <http://niftylettuce.com/> |


## Trademark Notice

Axe, Lad, Lass, Cabin, Lipo, and their respective logos are trademarks of Niftylettuce LLC.
These trademarks may not be reproduced, distributed, transmitted, or otherwise used, except with the prior written permission of Niftylettuce LLC.
If you are seeking permission to use these trademarks, then please [contact us](mailto:niftylettuce@gmail.com).


## License

[MIT](LICENSE) © [Nick Baugh](http://niftylettuce.com/)


## 

<a href="#"><img src="media/cabin-footer.png" alt="#" /></a>

[npm]: https://www.npmjs.com/

[yarn]: https://yarnpkg.com/

[passport]: http://www.passportjs.org/

[lad]: https://lad.js.org

[lass]: https://lass.js.org

[axe]: https://github.com/cabinjs/axe

[koa]: http://koajs.com/

[node]: https://nodejs.org

[koa-better-error-handler]: https://github.com/ladjs/koa-better-error-handler

[sharp]: http://sharp.dimens.io/

[lipo]: https://lipo.io

[browserify]: https://github.com/browserify/browserify

[webpack]: https://github.com/webpack/webpack

[rollup]: https://github.com/rollup/rollup

[uncaught]: https://github.com/aleksandr-oleynikov/uncaught

[xhook]: https://github.com/jpillora/xhook

[parse-request]: https://github.com/niftylettuce/parse-request

[parse-err]: https://github.com/niftylettuce/parse-err

[stacktrace]: https://www.stacktracejs.com/

[tracekit]: https://github.com/csnover/TraceKit

[promises]: https://caniuse.com/#feat=promises

[json]: https://caniuse.com/#feat=json

[cabin]: https://cabinjs.com

[signale]: https://github.com/klauscfhq/signale

[pino]: https://github.com/pinojs/pino

[sensitive-fields]: https://github.com/cabinjs/sensitive-fields/blob/master/index.json

[basicauth-headers]: https://en.wikipedia.org/wiki/Basic_access_authentication

[jwt-tokens]: https://en.wikipedia.org/wiki/JSON_Web_Token

[express]: https://expressjs.com

[multer]: https://github.com/expressjs/multer

[body-parser]: https://github.com/expressjs/body-parser

[morgan]: https://github.com/expressjs/morgan

[bunyan]: https://github.com/trentm/node-bunyan

[winston]: https://github.com/winstonjs/winston

[forwardemail]: https://forwardemail.net

[apache-clf]: https://github.com/expressjs/morgan#common
