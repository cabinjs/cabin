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
  Cabin is a logging/analytics service and middleware for <a href="https://nodejs.org">Node.js</a>, <a href="https://lad.js.org">Lad</a>, <a href="http://koajs.com/">Koa</a>, <a href="https://expressjs.com/">Express</a>, and <a href="http://www.passportjs.org/">Passport</a>.
</div>
<div align="center">
  <sub>
    Frustrated with Sentry, Timber, Airbrake, Papertrail, or Bugsnag?  We were too!
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
  * [Koa](#koa)
  * [Express](#express)
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

> Don't want to configure this yourself? You can simply use [Lad][] which has this all built-in for you already!

1. Simply include the middleware and pass [options](#options) if needed

2. Use `ctx.log(level, message, meta)` (Koa) or `req.log(level, message, meta)` (Express) to log messages anywhere in your app middleware functions.

3. You can also use shorthand method level calling, such as `ctx.log.debug(msg, meta)`, `ctx.log.info(msg, meta)`, `ctx.log.warn(msg, meta)`, or `ctx.log.error(msg, meta)` for Koa (and `req.log` equivalents for Express), which automatically populate the `level` argument with the respective level.

### Koa

```js
const Koa = require('koa');
const Cabin = require('cabin');

const app = new Koa();
const cabin = new Cabin();

// use the cabin middleware
app.use(cabin.middleware);

// add your user/session management middleware here (e.g. passport)

// this assumes that you are using passport which
// exposes `ctx.logout` to log out the logged in user
app.get('/logout', ctx => {

  ctx.log.warn('Logged out');
  // you could also use aliases:
  // `ctx.log('warn', 'Logged out')`
  // `ctx.logger.warn('Logged out')`
  // `ctx.logger('warn', 'Logged out')`

  ctx.logout();
  ctx.redirect('/');
});

// you can also use it to log activity such as user checking out
app.listen(3000);
```

### Express

```js
const express = require('express');
const Cabin = require('cabin');

const app = express();
const cabin = new Cabin();

// use the cabin middleware
app.use(cabin.middleware);

// add your user/session management middleware here (e.g. passport)

// this assumes that you are using passport which
// exposes `req.logout` to log out the logged in user
app.get('/logout', (req, res) => {

  req.log.warn('Logged out');
  // you could also use aliases:
  // `req.log('warn', 'Logged out')`
  // `req.logger.warn('Logged out')`
  // `req.logger('warn', 'Logged out')`

  req.logout();
  res.redirect('/');
});

app.listen(3000);
```


## Options

* `logger` (Object) - defaults to `console` (you might want to use something like [Lad's logger][lad-logger])
* `userFields` (Array) - defaults to `[ 'id', 'email', 'full_name']` - these are the default fields to store from a parsed user object


## Metadata

By default all users (even ones not logged in) will have a `user` object stored in the log metadata with their IP address stored as `user.ip_address`.

If a logged in user is detected (e.g. if you're using [Passport][]), then we add to the log metadata `user` object the properties and user's respective values (if any) for each value specified in the `userFields` option.

Also we add to log metadata by default a `request` object with HTTP `method`, `query_string`, `headers`, `cookies`, `body` (request body safe stringified using [fast-safe-stringify][]), and `url` properties.

Are we missing something? If so let us know by emailing <a href="mailto:niftylettuce@gmail.com">niftylettuce@gmail.com</a> or [filing an issue](https://github.com/cabinjs/cabin/issues/new) on GitHub.


## Related

* [koa-better-error-handler][] - A better error-handler for Lad and Koa. Makes `ctx.throw` awesome!
* [lad logger][lad-logger] - Logger for Lad
* [lad][] - Scaffold a [Koa][] webapp and API framework for [Node.js][node]
* [lass][] - Scaffold a modern boilerplate for [Node.js][node]


## Contributors

| Name           | Website                    |
| -------------- | -------------------------- |
| **Nick Baugh** | <http://niftylettuce.com/> |


## Trademark Notice

Lad, Lass, Cabin, and their respective logos are trademarks of Niftylettuce LLC.
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

[lad-logger]: https://github.com/ladjs/logger

[koa]: http://koajs.com/

[node]: https://nodejs.org

[koa-better-error-handler]: https://github.com/ladjs/koa-better-error-handler

[fast-safe-stringify]: https://github.com/davidmarkclements/fast-safe-stringify
