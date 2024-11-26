<h1 align="center">
  <a href="http://cabinjs.com"><img src="https://d1i8ikybhfrv4r.cloudfront.net/cabin-animated.gif" alt="cabin" /></a>
</h1>
<div align="center">
  <a href="https://github.com/cabinjs/cabin/actions/workflows/ci.yml"><img src="https://github.com/cabinjs/cabin/actions/workflows/ci.yml/badge.svg" alt="build status" /></a>
  <a href="https://github.com/sindresorhus/xo"><img src="https://img.shields.io/badge/code_style-XO-5ed9c7.svg" alt="code style" /></a>
  <a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/styled_with-prettier-ff69b4.svg" alt="styled with prettier" /></a>
  <a href="https://lass.js.org"><img src="https://img.shields.io/badge/made_with-lass-95CC28.svg" alt="made with lass" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/cabinjs/cabin.svg" alt="license" /></a>
  <a href="https://npm.im/cabin"><img src="https://img.shields.io/npm/dt/cabin.svg" alt="npm downloads" /></a>
</div>
<br />
<div align="center">
  Cabin is the best self-hosted <a href="https://en.wikipedia.org/wiki/JavaScript" target="_blank">JavaScript</a> and <a href="https://nodejs.org" target="_blank">Node.js</a> <a href="https://en.wikipedia.org/wiki/Logging_as_a_service" target="_blank">logging service</a>.
  <br />
  <small>Supports Node v18+, Browser Environments, <a href="https://expressjs.com" target="_blank">Express</a>, <a href="https://koajs.com" target="_blank">Koa</a>, and <a href="https://lad.js.org" target="_blank">Lad</a></small>
</div>
<hr />
<div align="center">
  Cabin is compatible with <a href="https://sentry.io" target="_blank">Sentry</a>, <a href="https://airbrake.io/" target="_blank">Airbrake</a>, <a href="https://papertrailapp.com/" target="_blank">Papertrail</a>, <a href="https://www.loggly.com/" target="_blank">Loggly</a>, and <a href="https://www.bugsnag.com/" target="_blank">Bugsnag</a>.
</div>
<hr />


## Table of Contents

* [Foreword](#foreword)
* [Quick Start](#quick-start)
* [Features](#features)
  * [Security, Privacy, and Business Focused](#security-privacy-and-business-focused)
  * [Reduce Disk Storage Costs](#reduce-disk-storage-costs)
  * [Cross-Platform and Cross-Browser Compatible](#cross-platform-and-cross-browser-compatible)
* [Send Logs to an HTTP endpoint](#send-logs-to-an-http-endpoint)
* [Send Logs to Slack](#send-logs-to-slack)
* [Send Logs to Sentry](#send-logs-to-sentry)
* [Send Logs to Datadog](#send-logs-to-datadog)
* [Send Logs to Papertrail](#send-logs-to-papertrail)
* [Suppress Logger Data](#suppress-logger-data)
* [Install](#install)
* [Usage](#usage)
  * [Logging](#logging)
  * [Route Logging Middleware](#route-logging-middleware)
  * [Node](#node)
  * [Browser](#browser)
  * [Automatic Request Logging](#automatic-request-logging)
  * [Stack Traces and Error Handling](#stack-traces-and-error-handling)
* [Options](#options)
* [Display Metadata and Stack Traces](#display-metadata-and-stack-traces)
* [Related](#related)
* [License](#license)


## Foreword

Please defer to Axe's [Foreword](https://github.com/cabinjs/axe/#foreword) for more insight.

Cabin is a layer on top of Axe that provides automatic logging for route middleware requests and errors.


## Quick Start

```sh
npm install express axe cabin signale
```

```js
const express = require('express');
const Axe = require('axe');
const Cabin = require('cabin');
const app = express();
const { Signale } = require('signale');

// initialize a new instance of Axe (see below TODO's that appeal to you)
const logger = new Axe({
  logger: new Signale()
});

// TODO: if you want to send logs to an HTTP endpoint then follow this guide:
// https://github.com/cabinjs/axe/#send-logs-to-http-endpoint

// TODO: if you want to send logs to Slack then follow this guide:
// https://github.com/cabinjs/axe/#send-logs-to-slack

// TODO: if you want to send logs to Sentry then follow this guide:
// https://github.com/cabinjs/axe/#send-logs-to-sentry

// TODO: if you want to send logs to Datadog then follow this guide:
// https://github.com/cabinjs/axe/#send-logs-to-datadog

// TODO: if you want to send logs to Papertrail then follow this guide:
// https://github.com/cabinjs/axe/#send-logs-to-papertrail

// TODO: if you want to suppress specific log metadata then follow this guide:
// https://github.com/cabinjs/axe/#suppress-logger-data

// initialize a new instance of Cabin with an Axe logger instance
const cabin = new Cabin({ logger });

//
// initialize route logging middleware
//
// NOTE: this will automatically log route middleware requests and errors
//
app.use(cabin.middleware);

app.get('/', (req, res, next) => res.send('OK'));

// start the server
app.listen(3000);
```

```sh
curl http://localhost:3000
```


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

It supports **Node v18+** and modern browsers out of the box (its browser-ready bundle **is only 20 KB**).

```sh
npx browserslist
```

```sh
and_chr 107
and_ff 106
and_qq 13.1
and_uc 13.4
android 107
chrome 107
chrome 106
chrome 105
edge 107
edge 106
edge 105
firefox 106
firefox 105
firefox 102
ios_saf 16.1
ios_saf 16.0
ios_saf 15.6
ios_saf 15.5
ios_saf 14.5-14.8
kaios 2.5
op_mini all
op_mob 64
opera 91
opera 90
safari 16.1
safari 16.0
safari 15.6
samsung 18.0
samsung 17.0
```


## Send Logs to an HTTP endpoint

See the [Quick Start](#quick-start) section above and our guide at <https://github.com/cabinjs/axe/#send-logs-to-http-endpoint>.


## Send Logs to Slack

See the [Quick Start](#quick-start) section above and our guide at <https://github.com/cabinjs/axe/#send-logs-to-slack>.


## Send Logs to Sentry

See the [Quick Start](#quick-start) section above and our guide at <https://github.com/cabinjs/axe/#send-logs-to-sentry>.


## Send Logs to Datadog

See the [Quick Start](#quick-start) section above and our guide at <https://github.com/cabinjs/axe/#send-logs-to-datadog>.


## Send Logs to Papertrail

See the [Quick Start](#quick-start) section above and our guide at <https://github.com/cabinjs/axe/#send-logs-to-papertrail>.


## Suppress Logger Data

See the [Quick Start](#quick-start) section above and our guide at <https://github.com/cabinjs/axe/#suppress-logger-data>.


## Install

**Note that as of v11.0.0 Cabin requires a peer dependency of [Axe][] to be installed.**

[npm][]:

```sh
npm install cabin axe
```


## Usage

### Logging

```js
const Cabin = require('cabin');
const cabin = new Cabin({
  // ... see the Quick Start and Options sections
});

cabin.info('hello world');
cabin.error(new Error('oops!'));
```

### Route Logging Middleware

```js
app.use(cabin.middleware);
```

See either the [Node](#node) or [Browser](#browser) instructions below for further route middleware usage and proper setup.

### Node

> The examples below show how to use Cabin in combination with [Axe][], [Signale][] (instead of `console`), and how to add an accurate `X-Response-Time` response time metric to your logs and response headers automatically.

#### Koa

1. Install required and recommended dependencies:

   ```sh
   npm install koa cabin signale request-received koa-better-response-time koa-better-request-id
   ```

2. Implement the example code below ([also found here](examples/koa.js)):

   ```js
   const Koa = require('koa');
   const Cabin = require('cabin');
   const Router = require('koa-router');
   const requestReceived = require('request-received');
   const responseTime = require('koa-better-response-time');
   const requestId = require('koa-better-request-id');
   const { Signale } = require('signale');

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
   npm install express cabin signale request-received response-time express-request-id
   ```

2. Implement the example code below ([also found here](examples/express.js)):

   ```js
   const express = require('express');
   const Cabin = require('cabin');
   const requestReceived = require('request-received');
   const responseTime = require('response-time');
   const requestId = require('express-request-id');
   const { Signale } = require('signale');

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

This package requires Promise support, therefore you will need to polyfill if you are using an unsupported browser (namely Opera mini).

**We no longer support IE as of Cabin v10.0.0+.**

#### VanillaJS

This is the solution for you if you're just using `<script>` tags everywhere!

```html
<script src="https://cdnjs.cloudflare.com/polyfill/v3/polyfill.min.js?features=Promise"></script>
<script src="https://unpkg.com/cabin"></script>
<script type="text/javascript">
  (function() {
    var cabin = new Cabin();
    cabin.setUser({
      id: '1',
      email: 'test@example.com',
      full_name: 'Test'
    });
    cabin.info('viewed docs');
  })();
</script>
```

#### Required Browser Features

We recommend using <https://cdnjs.cloudflare.com/polyfill> (specifically with the bundle mentioned in [VanillaJS](#vanillajs) above):

```html
<script src="https://cdnjs.cloudflare.com/polyfill/v3/polyfill.min.js?features=Promise"></script>
```

* Promise is not supported in op\_mini all

#### Bundler

This assumes you are using [browserify][], [webpack][], [rollup][], or another bundler.

```js
const Cabin = require('cabin');

const cabin = new Cabin();

cabin.setUser({
  id: '1',
  email: 'test@example.com',
  full_name: 'Test'
});

cabin.info('viewed docs');
```

### Automatic Request Logging

#### Server

For server-side logging of requests, the Cabin middleware `cabin.middleware` will automatically log requests for you upon completion.  Just make sure you are using `express-request-id` middleware like in the examples above in order for the `X-Request-Id` header to be set (and re-used if already exists, e.g. generated from client side as in below).  If you're using Koa make sure to use `koa-better-request-id` as shown in the examples above.

#### Browser

We strongly recommend that you implement one of the following code snippets with [xhook][] (for either VanillaJS or Bundler approaches) so that all your XHR requests have a `X-Request-Id` automatically added (which in turn ensures both client and server have matching request ID's).  Imagine how awesome your logs will be when you can see the full trace starting with the client!

##### HTML

```html
<script src="https://cdnjs.cloudflare.com/polyfill/v3/polyfill.min.js?features=Promise"></script>
<script src="https://unpkg.com/xhook"></script>
<script src="https://unpkg.com/cabin"></script>
<script src="https://unpkg.com/parse-request"></script>
<script src="https://unpkg.com/cuid"></script>
<script>
  (function() {
    var cabin = new Cabin();
    cabin.setUser({
      id: '1',
      email: 'test@example.com',
      full_name: 'Test'
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
script(src='https://cdnjs.cloudflare.com/polyfill/v3/polyfill.min.js?features=Promise')
script(src='https://unpkg.com/xhook')
script(src='https://unpkg.com/cabin')
script(src='https://unpkg.com/parse-request')
script(src='https://unpkg.com/cuid')
script.
  (function() {
    var cabin = new Cabin();
    cabin.setUser({
      id: '1',
      email: 'test@example.com',
      full_name: 'Test'
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

```js
const Cabin = require('cabin');
const xhook = require('xhook');
const parseRequest = require('parse-request');
const cuid = require('cuid');

const cabin = new Cabin();

cabin.setUser({
  id: '1',
  email: 'test@example.com',
  full_name: 'Test'
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

const cabin = new Cabin();

process.on('uncaughtException', err => {
  cabin.error(err);
  process.exit(1);
});

process.on('unhandledRejection', err => {
  cabin.error(err);
});
```

#### Browser

Since cross-browser support is very limited and non-standardized for errors and stack traces, we highly recommend to use [StackTrace](#stacktrace).

##### StackTrace

We recommend to use [StackTrace][] instead of [TraceKit][tracekit] as it is a more modern alternative and provides much similarity between your Browser and your Node errors (stackframes are basically similar to representations in Gecko and V8, aka the ones you get with Node).

It does require you to have a polyfill if you're using it in the browser (only if you're supporting browsers that don't support standardized Promises/JSON).  You'll basically need `es6-promise` and `json3` polyfills for browsers you wish to support that don't have them.  The example below shows you how to polyfill, don't worry!  You can reference Caniuse data on [Promises][] and [JSON][] respectively if you need.

The example below demonstrates using StackTrace with [uncaught][] to catch global errors below.

```html
<script src="https://cdnjs.cloudflare.com/polyfill/v3/polyfill.min.js?features=Promise"></script>
<script src="https://unpkg.com/stackframe"></script>
<script src="https://unpkg.com/stacktrace-js"></script>
<script src="https://unpkg.com/uncaught"></script>
<script src="https://unpkg.com/cabin"></script>
<script src="https://unpkg.com/prepare-stack-trace"></script>

<script type="text/javascript">
  (function() {
    //
    // Sourced from the StackTrace example from CabinJS docs
    // <https://github.com/cabinjs/cabin#stacktrace>
    //
    var cabin = new Cabin();

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


## Options

* `logger` (Object or [Axe][] instance) - if you have a custom logger you wish to use or an existing [Axe][] instance – defaults to an instance of [Axe][] which uses `console` as the logger – if you do not pass an instance of Axe, then an instance will be created and the `logger` option will be passed down
* `meta` (Object) - defaults to an empty object - this will get passed as metadata (e.g. you could set a custom `meta.user` object here for every request)
* `parseRequest` (Object) - defaults to an empty object, which means it will use the defaults from [parse-request][] (see [Metadata](#metadata) below)
* `errorProps` (Array) - a list of properties to cherry-pick from the error object parsed out of err thanks to [parse-err][] (by default all properties are returned; even non-enumerable ones and ones on the prototype object) (see [Metadata](#metadata) below)
* `message` (Function) - inspired by [morgan][], and defaults to a [dev-friendly format](https://github.com/expressjs/morgan#short) (or if in production mode, then it uses a [standard Apache common log format][apache-clf])). – when requests finish, it will utilize `logger` to output an error, warn, or info level log based off the status code, and this function is used to determine the string sent to the logger.  It accepts one argument `options`, which is comprised of `options.level`, `options.req`, `options.res`, and optionally (if and only if Koa) `options.ctx`.  It is required that this function return a String.  See [src/message.js](src/message.js) for the default message function.  Note that both dev-friendly and Apache common log formats are stripped of basic auth lines for obvious security reasons.  **Note that if a `null` or `undefined` value is returned from the message function, then the logger will not be invoked unless there is an error.**


## Display Metadata and Stack Traces

Under the hood, Cabin uses [Axe][] which provides us with several options, including one to show metadata (e.g. request headers, body, and user) and another to show stack traces for errors.

To show/hide application metadata and/or stack traces, see the [Axe options documentation](https://github.com/cabinjs/axe#options).

Cabin uses the package [parse-request][] to parse the request metadata for you automatically in your Express and Koa applications.

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

As you can see, sensitive data is masked and contextual user information metadata is automatically populated.


## Related

* [Forward Email][forward-email] - Free, encrypted, and open-source email forwarding service for custom domains
* [Axe][] - Logging utility for Node and Browser environments. Chop up your logs!
* [Bree][] - The best job scheduler for [Node.js][node]
* [Lad][] - Scaffold a [Koa][] webapp and API framework for [Node.js][node]
* [Lass][] - Scaffold a modern boilerplate for [Node.js][node]
* [koa-better-error-handler][] - A better error-handler for Lad and Koa. Makes `ctx.throw` awesome!


## License

[MIT](LICENSE) © Titanism


##

<a href="#"><img src="media/cabin-footer.png" alt="#" /></a>

[bree]: https://jobscheduler.net

[npm]: https://www.npmjs.com/

[passport]: http://www.passportjs.org/

[lad]: https://lad.js.org

[lass]: https://lass.js.org

[axe]: https://github.com/cabinjs/axe

[koa]: http://koajs.com/

[node]: https://nodejs.org

[koa-better-error-handler]: https://github.com/ladjs/koa-better-error-handler

[webpack]: https://github.com/webpack/webpack

[rollup]: https://github.com/rollup/rollup

[uncaught]: https://github.com/aleksandr-oleynikov/uncaught

[xhook]: https://github.com/jpillora/xhook

[parse-request]: https://github.com/cabinjs/parse-request

[parse-err]: https://github.com/cabinjs/parse-err

[stacktrace]: https://www.stacktracejs.com/

[tracekit]: https://github.com/csnover/TraceKit

[promises]: https://caniuse.com/#feat=promises

[json]: https://caniuse.com/#feat=json

[signale]: https://github.com/klauscfhq/signale

[sensitive-fields]: https://github.com/cabinjs/sensitive-fields/blob/master/index.json

[basicauth-headers]: https://en.wikipedia.org/wiki/Basic_access_authentication

[jwt-tokens]: https://en.wikipedia.org/wiki/JSON_Web_Token

[express]: https://expressjs.com

[multer]: https://github.com/expressjs/multer

[body-parser]: https://github.com/expressjs/body-parser

[morgan]: https://github.com/expressjs/morgan

[forward-email]: https://forwardemail.net

[apache-clf]: https://github.com/expressjs/morgan#common

[browserify]: https://github.com/browserify/browserify
