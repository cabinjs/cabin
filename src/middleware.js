const format = require('@ladjs/format-util');
const formatSpecifiers = require('format-specifiers');
const onFinished = require('on-finished');
const parseRequest = require('parse-request');
const { isFunction, isUndefined } = require('./utils');

module.exports = function (...args) {
  const isExpress = !isUndefined(args[2]) && isFunction(args[2]);
  const request = isExpress ? args[0] : args[0].req;
  const res = isExpress ? args[1] : args[0].res;
  // const request = isExpress ? args[0] : args[0].request;
  // const response = isExpress ? args[1] : args[0].response;
  const ctx = args[0];
  const next = isExpress ? args[2] : args[1];
  const logger = {};
  //
  // Note that `params` is not named `args` because ESLint doesn't warn:
  // <https://github.com/eslint/eslint/issues/11915>
  //
  for (const key of Object.keys(this.config.logger).filter((key) =>
    isFunction(this.config.logger[key])
  )) {
    logger[key] = (...parameters) => {
      // support format specifiers
      if (
        typeof parameters[0] === 'string' &&
        formatSpecifiers.some((t) => parameters[0].includes(t)) &&
        parameters[1]
      ) {
        parameters[0] = format(parameters[0], parameters[1]);
        parameters[1] = undefined;
      }

      parameters[1] = isUndefined(parameters[1])
        ? {}
        : this.parseArg(parameters[1]);
      // add `request` object to metadata
      Object.assign(
        parameters[1],
        parseRequest(
          Object.assign(
            isExpress ? { req: request } : { ctx },
            //
            // this symbol was not added until Node v7.7.0
            // and we try to support Node v6.4+
            // <https://github.com/nodejs/node/issues/17745>
            //
            // <https://github.com/nodejs/node/blob/v7.10.0/lib/_http_outgoing.js#L379-L380>
            // <https://github.com/nodejs/node/blob/v7.7.0/lib/_http_outgoing.js#L379-L380>
            // <https://github.com/nodejs/node/blob/v6.4.0/lib/_http_outgoing.js#L351-L352>
            //
            // Note that for the fallback `_headers` all the keys are lowercased
            //
            // But note that in node v12.4.0 for instance this prop is deprecated
            // <https://github.com/nodejs/node/blob/v12.4.0/lib/_http_outgoing.js#L116>
            // So we are left with either the Symbol or use of `getHeaders`
            //
            // HOWEVER automatic properties like Date header aren't
            // set when you do `getHeaders`, they are only written to `_header`
            // and so we need `parse-request` to parse the `responseHeaders`
            // as a String using `http-headers`...
            // <https://github.com/nodejs/node/issues/28302>
            //
            // note that HTTP2 responses do not have a String value
            // for `res._header`, and instead is a Boolean value
            // <https://github.com/nodejs/node/issues/30894>
            // <https://github.com/cabinjs/cabin/issues/133>
            {
              responseHeaders:
                typeof res._header === 'string'
                  ? res._header
                  : typeof res.getHeaders === 'function'
                    ? res.getHeaders()
                    : null
            },
            this.config.parseRequest
          )
        )
      );

      return this.config.logger[key](...Array.prototype.slice.call(parameters));
    };
  }

  // upon completion of a response we need to log it
  onFinished(res, (err) => {
    if (err) logger.error(err);
    let level = 'info';
    if (res.statusCode >= 500) level = 'error';
    else if (res.statusCode >= 400) level = 'warn';
    const message = this.config.message({
      level,
      req: request,
      res,
      ...(isExpress ? {} : { ctx: args[0] })
    });
    if (err) {
      logger[level](message || err.message, { err });
    } else if (message) {
      logger[level](message);
    }
  });
  // add `log` (shorthand) and `logger` methods
  // `req.log`
  // `res.log`
  // `ctx.req`
  // `ctx.res`
  // `ctx.request`
  // `ctx.response`
  // <https://github.com/pinojs/koa-pino-logger/issues/14>
  // <https://github.com/pinojs/koa-pino-logger/blob/master/logger.js#L11>
  // <https://github.com/pinojs/pino-http/blob/master/logger.js#L55>
  if (isExpress) {
    request.log = logger;
    res.log = logger;
    request.logger = logger;
    res.logger = logger;
  } else {
    const ctx = args[0];
    ctx.log = logger;
    ctx.logger = logger;
    ctx.request.log = logger;
    ctx.request.logger = logger;
    ctx.response.log = logger;
    ctx.response.logger = logger;
  }

  return next();
};
