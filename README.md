<h1 align="center">
  <a href="http://cabinjs.com"><img src="https://d1i8ikybhfrv4r.cloudfront.net/cabin-animated.gif" alt="cabin" /></a>
</h1>
<div align="center">
  <a href="http://slack.crocodilejs.com"><img src="http://slack.crocodilejs.com/badge.svg" alt="chat" /></a>
  <a href="https://semaphoreci.com/niftylettuce/cabin"><img src="https://semaphoreci.com/api/v1/niftylettuce/cabin/branches/master/shields_badge.svg" alt="build status"></a>
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
    Frustrated with Sentry, Airbrake, Papertrail, or Bugsnag?  We were too!
    &bull; Built by <a href="https://github.com/niftylettuce">@niftylettuce</a>
    and <a href="#contributors">contributors</a>
  </sub>
</div>
<hr />
<div align="center"><strong>Cabin is in alpha development, join us in <a href="http://slack.crocodilejs.com">Slack</a></strong>.  Our web-based dashboard will be available soon!</div>
<hr />


## Table of Contents

* [Install](#install)
* [Usage](#usage)
  * [Node](#node)
  * [Browser](#browser)
  * [Stack Traces and Error Handling](#stack-traces-and-error-handling)
* [Options](#options)
* [Metadata](#metadata)
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

### Node

#### Koa

```js
const Koa = require('koa');
const Cabin = require('cabin');

const app = new Koa();
const cabin = new Cabin({ key: 'YOUR-CABIN-API-KEY' });

// use the cabin middleware
app.use(cabin.middleware);

// add your user/session management middleware here (e.g. passport)

// this assumes that you are using passport which
// exposes `ctx.logout` to log out the logged in user
app.get('/logout', ctx => {

  ctx.log.warn('Logged out');
  ctx.logger.warn('Logged out'); // same thing

  ctx.logout();
  ctx.redirect('/');
});

// you can also use it to log activity such as user checking out
app.listen(3000);
```

#### Express

```js
const express = require('express');
const Cabin = require('cabin');

const app = express();
const cabin = new Cabin({ key: 'YOUR-CABIN-API-KEY' });

// use the cabin middleware
app.use(cabin.middleware);

// add your user/session management middleware here (e.g. passport)

// this assumes that you are using passport which
// exposes `req.logout` to log out the logged in user
app.get('/logout', (req, res) => {

  req.log.warn('Logged out');
  req.logger.warn('Logged out'); // same thing

  req.logout();
  res.redirect('/');
});

app.listen(3000);
```

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

#### Log Requests/Responses

If you want to log all client-side [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) or [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) requests, then we recommend using [xhook][].  The examples provided below show you how to integrate this, but it is optional of course!

##### VanillaJS

```html
<script src="https://unpkg.com/xhook"></script>
<script src="https://unpkg.com/cabin"></script>
<script type="text/javascript">
  (function() {
    var cabin = new Cabin({ key: 'YOUR-CABIN-API-KEY' });
    cabin.setUser({
      id: '1',
      email: 'niftylettuce@gmail.com',
      full_name: 'niftylettuce'
    });
    xhook.before(function(req) {
      cabin.info('request queued', cabin.parseRequest(req));
    });
    xhook.after(function(req, res) {
      cabin.info('request complete', cabin.parseRequest(req));
    });
  })();
</script>
```

##### Bundler

[npm][]:

```sh
npm install xhook
```

[yarn][]:

```sh
yarn add xhook
```

```js
const Cabin = require('cabin');
const xhook = require('xhook');

const cabin = new Cabin({ key: 'YOUR-CABIN-API-KEY' });

cabin.setUser({
  id: '1',
  email: 'niftylettuce@gmail.com',
  full_name: 'niftylettuce'
});

xhook.before(req => {
  cabin.info('request queued', cabin.parseRequest(req));
});

xhook.after((req, res) => {
  cabin.info('request complete', cabin.parseRequest(req));
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
<!--
<script src="https://unpkg.com/stacktrace-js/dist/stacktrace-with-promises-and-json-polyfills.js"></script>
-->

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
          // StackTrace has a convienient `report` method however
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

It is widely used by logging services and seems to be the most popular tool.

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


## Options

* `key` (String) - defaults to an empty string, **this is where you put your Cabin API key**, which you can get for free at [Cabin][]
* `axe` (Object) - defaults to an empty Object `{}`, but you can pass options here for [Axe][], such as `{ key: 'YOUR-CABIN-API-KEY' }` or `{ capture: false }` to turn off log HTTP capture.  Note if you specify a `key` option (see the line above this one), then it will be used as your API key instead of one specified here.
* `logger` (Object) - if you have a custom logger you wish to use instead of [Axe][], but note that Axe accepts a `logger` option, so you should use that instead, see [Axe][] docs for more info.
* `meta` (Object) - defaults to an empty object - this will get passed as metadata (e.g. you could set a custom `meta.user` object here for every request).
* `userFields` (Array) - defaults to `[ 'id', 'email', 'full_name']` - these are the default fields to store from a parsed user object, this is consumed by [parse-request][] (see [Metadata](#metadata) below).
* `fields` (Array) - defaults to an empty Array `[]`  - these are the default fields to store from a parsed user object, this is consumed by [parse-err][] (see [Metadata](#metadata) below).


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
