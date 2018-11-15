<h1 align="center">
  <a href="http://cabinjs.com"><img src="https://d1i8ikybhfrv4r.cloudfront.net/cabin-animated.gif" alt="cabin" /></a>
</h1>
<div align="center">
  <a href="http://slack.crocodilejs.com"><img src="http://slack.crocodilejs.com/badge.svg" alt="chat" /></a>
  <a href="https://travis-ci.org/cabinjs/cabin"><img src="https://travis-ci.org/cabinjs/cabin.svg?branch=master" alt="build status" /></a>
  <a href="https://codecov.io/github/cabinjs/cabin"><img src="https://img.shields.io/codecov/c/github/cabinjs/cabin/master.svg" alt="code coverage" /></a>
  <a href="https://github.com/sindresorhus/xo"><img src="https://img.shields.io/badge/code_style-XO-5ed9c7.svg" alt="code style" /></a>
  <a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/styled_with-prettier-ff69b4.svg" alt="styled with prettier" /></a>
  <a href="https://lass.js.org"><img src="https://img.shields.io/badge/made_with-lass-95CC28.svg" alt="made with lass" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/cabinjs/cabin.svg" alt="license" /></a>
</div>
<br />
<div align="center">
  Cabin is a logging/analytics service and middleware for the Browser, <a href="https://nodejs.org">Node.js</a>, <a href="https://lad.js.org">Lad</a>, <a href="http://koajs.com/">Koa</a>, <a href="https://expressjs.com/">Express</a>, and <a href="http://www.passportjs.org/">Passport</a>.
</div>
<div align="center">
  <sub>
    Need an alternative to Sentry, Airbrake, Papertrail, or Bugsnag?  We did too!
    &bull; Built by <a href="https://github.com/niftylettuce">@niftylettuce</a>
    and <a href="#contributors">contributors</a>
  </sub>
</div>
<hr />
<div align="center"><strong>Cabin is in alpha development, join us in <a href="http://slack.crocodilejs.com">Slack</a></strong>.  Our web-based dashboard will be available soon!</div>
<hr />

<div align="center">:heart: Love this project? Support <a href="https://github.com/niftylettuce" target="_blank">@niftylettuce's</a> <a href="https://en.wikipedia.org/wiki/Free_and_open-source_software" target="_blank">FOSS</a> on <a href="https://patreon.com/niftylettuce" target="_blank">Patreon</a> or <a href="https://paypal.me/niftylettuce">PayPal</a> :unicorn:</div>


## Table of Contents

* [Install](#install)
* [Usage](#usage)
  * [Logging](#logging)
  * [Node](#node)
  * [Browser](#browser)
  * [Stack Traces and Error Handling](#stack-traces-and-error-handling)
* [Display Metadata and Stack Traces](#display-metadata-and-stack-traces)
  * [Metadata](#metadata)
  * [Stack Traces](#stack-traces)
* [Options](#options)
* [Metadata](#metadata-1)
* [Related](#related)
* [Contributors](#contributors)
* [Trademark Notice](#trademark-notice)
* [License](#license)


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

Cabin exposes all log levels from the built-in logger ([Axe][]) or whichever custom `logger` you pass.

Each log level should be invoked with two arguments `message` and `meta`.

* `message` (String or Error) - this should be either a String or an Error object
* `meta` (Object) - this is optional, and inherits properties from `config.meta`

See either the [Node](#node) or [Browser](#browser) instructions below for further usage (e.g. route middleware).

### Node

> The examples below show how to use Cabin in combination with [Axe][], [Signale][] logging utility (for development), [Pino][] logging utility (for production), and how to add an accurate `X-Response-Time` response time metric to your logs and response headers automatically.

#### Koa

> Don't want to configure this yourself? We **highly recommend** to use [Lad][] instead of configuring this yourself as it has all of this pre-configured for you with best-practices.  However if you already have an existing [Koa][] based project the example below will sufficiently serve as a guide for implementation.

1. Install required and recommended dependencies:

   ```sh
   npm install koa cabin signale pino response-time koa-connect express-request-id
   ```

2. Implement the example code below ([also found here](examples/koa.js)):

   ```js
   const Koa = require('koa');
   const Cabin = require('cabin');
   const Router = require('koa-router');
   const koaConnect = require('koa-connect');
   const responseTime = require('response-time');
   const requestId = require('express-request-id');
   const { Signale } = require('signale');
   const pino = require('pino')({
     customLevels: {
       log: 30
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

   // adds `X-Response-Time` header to responses
   app.use(koaConnect(responseTime));

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
   ```

3. See [Koa convenience methods below](#koa-1) for helper utilities you can use while writing code.

#### Express

1. Install required and recommended dependencies:

   ```sh
   npm install koa cabin signale pino response-time express-request-id
   ```

2. Implement the example code below ([also found here](examples/express.js)):

   ```js
   const express = require('express');
   const Cabin = require('cabin');
   const responseTime = require('response-time');
   const requestId = require('express-request-id');
   const { Signale } = require('signale');
   const pino = require('pino')({
     customLevels: {
       log: 30
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
     req.logger.info('someone visited the home page');
     res.send('hello world');
   });

   // this assumes that you are using passport which
   // exposes `req.logout` to log out the logged in user
   app.get('/logout', (req, res) => {
     req.logger.warn('Logged out');
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
* `ctx.req.log`
* `ctx.req.logger`
* `ctx.res.log`
* `ctx.res.logger`
* `ctx.request.log`
* `ctx.request.logger`
* `ctx.response.log`
* `ctx.response.logger`

### Browser

#### VanillaJS

This is the solution for you if you're just using `<script>` tags everywhere!

```html
<script src="https://unpkg.com/cabin"></script>
<script type="text/javascript">
  (function() {
    var cabin = new Cabin({ key: 'YOUR-CABIN-API-KEY' });
    cabin.setUser({
      id: '1',
      email: 'niftylettuce@gmail.com',
      full_name: 'niftylettuce'
    });
    cabin.info('viewed docs');
  })();
</script>
```

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

#### Automatic Request Logging

##### Server

For server-side logging of requests, the Cabin middleware `cabin.middleware` will automatically log requests for you upon completion.  Just make sure you are using `express-request-id` middleware like in the examples above in order for the `X-Request-Id` header to be set (and re-used if already exists, e.g. generated from client side as in below).  If you're using Koa make sure to wrap with `koaConnect` as shown in the examples above.

##### Browser

**We strongly recommend that you implement one of the following code snippets with [xhook][] (for either VanillaJS or Bundler approaches) so that all your XHR requests have a `X-Request-Id` automatically added (which in turn ensures both client and server have matching request ID's).  Imagine how awesome your logs will be when you can see the full trace starting with the client!**

##### Pug

> You can do a similar approach with React, EJS, or another templating language.

```pug
script(src='https://unpkg.com/xhook')
script(src='https://unpkg.com/cabin')
script(src='https://unpkg.com/cuid')
script.
  (function() {
    var cabin = new Cabin({ key: 'YOUR-CABIN-API-KEY' });
    cabin.setUser({
      id: '1',
      email: 'niftylettuce@gmail.com',
      full_name: 'niftylettuce'
    });
    xhook.before(function(req) {
      if (!req.headers['X-Request-Id'])
        req.headers['X-Request-Id'] = cuid();
      cabin.info('xhr', cabin.parseRequest(req));
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
const cuid = require('cuid');

const cabin = new Cabin({ key: 'YOUR-CABIN-API-KEY' });

cabin.setUser({
  id: '1',
  email: 'niftylettuce@gmail.com',
  full_name: 'niftylettuce'
});

xhook.before(req => {
  if (!req.headers['X-Request-Id'])
    req.headers['X-Request-Id'] = cuid();
  cabin.info('xhr', cabin.parseRequest(req));
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

Since cross-browser support is very limited and unstandardized for errors and stack traces, we highly recommend to use either [StackTrace](#stacktrace) or [TraceKit](#tracekit) as documented below.

##### StackTrace

We recommend to use [StackTrace][] instead of [TraceKit](#tracekit) as it is a more modern alternative and provides much similarity between your Browser and your Node errors (stackframes are basically similar to representations in Gecko and V8, aka the ones you get with Node).

It does require you to have a polyfill if you're using it in the browser (only if you're supporting browsers that don't support standardized Promises/JSON).  You'll basically need `es6-promise` and `json3` polyfills for browsers you wish to support that don't have them.  The example below shows you how to polyfill, don't worry!  You can reference Caniuse data on [Promises][] and [JSON][] respectively if you need.

The example below demonstrates using StackTrace with [uncaught][] to catch global errors below, but note that [uncaught][] only supports IE11+, so if you need &lt; IE11 support you probably should use [TraceKit](#tracekit) instead.

If you're curious why it won't work in IE11, please see this [great documentation on JavaScript errors cross-browser here](https://github.com/mknichel/javascript-errors#windowonerror) - in particular the section on "No Error object provided".

```html
<script src="https://unpkg.com/stacktrace-js"></script>
<!-- Use this instead of the above if you need to polyfill for IE11 support -->
<!-- <script src="https://unpkg.com/stacktrace-js/dist/stacktrace-with-promises-and-json-polyfills.js"></script> -->

<script src="https://unpkg.com/uncaught"></script>
<script src="https://unpkg.com/cabin"></script>

<script type="text/javascript">
  (function() {
    var cabin = new Cabin({ key: 'YOUR-CABIN-API-KEY' });
    uncaught.start();
    uncaught.addListener(function(err) {
      // this will transform the error's `stack` property
      // to be consistently similar to Gecko and V8 stackframes
      StackTrace.fromError(err)
        .then(function(stackframes) {
          // StackTrace has a convenient `report` method however
          // we want to send along more information than just this
          // <https://github.com/stacktracejs/stacktrace.js#stacktracereportstackframes-url-message-requestoptions--promisestring>
          // StackTrace.report(stackframes, endpoint, err.message);
          // however we want to leave it up to the logger to
          // report and record the error
          err.stack = stackframes;
          cabin.error(err);
        })
        .catch(function(_err) {
          // log both original and new error
          cabin.error(err);
          cabin.error(_err);
        });
    });
  })();
</script>
```

##### TraceKit

This is a legacy stack trace package with support for very old browsers.  You can view [TraceKit's full documentation here][tracekit].

It is widely used by logging services and seems to be the most popular tool.  Note that in the example code below, you will notice a repetitive pattern you'll encounter of wrapping code with a `try` and `catch` block.  Don't worry, because if you're using `webpack` or `gulp`, you can easily wrap your bundled files with `try` and `catch` blocks!  See [Automatic Try Catch Wrapping](#automatic-try-catch-wrapping) below.

```html
<script src="https://unpkg.com/tracekit"></script>
<script src="https://unpkg.com/cabin"></script>

<script type="text/javascript">
  (function() {
    var cabin = new Cabin({ key: 'YOUR-CABIN-API-KEY' });

    // when `TraceKit.report` gets called
    // this subscribe function will be invoked
    TraceKit.report.subscribe(function(err) {
      cabin.error(err);
    });

    try {
      // put all your application code in a global try/catch block
      //
      // ...
      //
      // maybe you throw an error in here by accident? it'll get caught!
      // throw new Error('oops');
    } catch (err) {
      TraceKit.report(err);
    }
  })();
</script>
```

##### Automatic Try Catch Wrapping

##### Gulp

```sh
npm install -D gulp-wrap
```

```js
const wrap = require('gulp-wrap');

gulp.src('./asset.js')
  .pipe(wrap(`
    try {
      <%= contents %>
    } catch (err) {
      TraceKit.report(err);
    }
  `))
  .pipe(gulp.dest('./dist'));
```

##### Webpack

```sh
npm install -D wrapper-webpack-plugin
```

```js
const WrapperPlugin = require('wrapper-webpack-plugin');

module.exports = {
  // other webpack config here
  plugins: [
    new WrapperPlugin({
      test: /\.js$/, // only wrap output of bundle files with '.js' extension
      header: 'try {\n',
      footer: '\n} catch (err) {\n  TraceKit.report(err);\n}'
    })
  ]
};
```


## Display Metadata and Stack Traces

Under the hood, Cabin uses [Axe][] which provides us with several options, including one to show metadata (e.g. request headers, body, and user) and another to show stack traces for errors.

You can pass these options through the `axe` option (see [Options](#options) below) – or – you could pass environment flags when you need to.

**By default, [Axe][] does not output any metadata and only outputs stack traces in non-production environments.**

### Metadata

To show metadata, pass a truthy value for the process environment variable `SHOW_META`.

> (e.g. `SHOW_META=1` or `SHOW_META=true` before running your script – `SHOW_META=true node app`).

Similarly if you pass a falsy value of `0` or `false` it will hide metadata.

### Stack Traces

To show stack traces, pass a truthy value for the process environment variable `SHOW_STACK`.

> (e.g. `SHOW_STACK=1` or `SHOW_STACK=true` before running your script – `SHOW_STACK=true node app`).

Similarly if you pass a falsy value of `0` or `false` it will hide stack traces.


## Options

* `key` (String) - defaults to an empty string, **this is where you put your Cabin API key**, which you can get for free at [Cabin][]
* `axe` (Object) - defaults to an empty Object `{}`, but you can pass options here for [Axe][]
* `logger` (Object) - if you have a custom logger you wish to use instead of [Axe][], but note that Axe accepts a `logger` option, so you should use that instead, see [Axe][] docs for more info.
* `meta` (Object) - defaults to an empty object - this will get passed as metadata (e.g. you could set a custom `meta.user` object here for every request).
* `userFields` (Array) - defaults to `[ 'id', 'email', 'full_name']` - these are the default fields to store from a parsed user object, this is consumed by [parse-request][] (see [Metadata](#metadata) below).
* `fields` (Array) - defaults to an empty Array `[]`  - these are the default fields to store from a parsed user object, this is consumed by [parse-err][] (see [Metadata](#metadata) below).
* `message` (String) - defaults to a generic log output (see [src/index.js](src/index.js)'s `message` option) - this is used by `cabin.middleware` when requests finish, it will utilize `logger` to output an error, warn, or info level log based off the status code
* `templateSettings` (Object) - defaults to variable interpolation with `{{ var }}` vs `<%= var %>` (see [Lodash template docs][lodash-template-docs])


## Metadata

We use the packages [parse-request][] and [parse-err][] to populate a metadata object `meta` with properties `request`, `user`, and `err`.

The `request` and `user` objects contains parsed header, cookie, body, and user information (including IP) via [parse-request][].  The `err` object contains parsed error fields including non-enumerable properties (which are normally not visible) on Error objects (this uses [parse-err][] under the hood).

If a logged in user is detected (e.g. if you're using [Passport][]), then a `meta.user` property is automatically created for you (depending on `userFields` option passed to Cabin, see [Options](#options) above).


## Related

* [koa-better-error-handler][] - A better error-handler for Lad and Koa. Makes `ctx.throw` awesome!
* [axe][] - Logging utility for Node and Browser environments. Chop up your logs!
* [lad][] - Scaffold a [Koa][] webapp and API framework for [Node.js][node]
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

[lodash-template-docs]: https://lodash.com/docs/4.17.10#template

[signale]: https://github.com/klauscfhq/signale

[pino]: https://github.com/pinojs/pino
