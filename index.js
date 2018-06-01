const url = require('url');
const cookie = require('cookie');
const autoBind = require('auto-bind');
const {
  isString,
  isObject,
  cloneDeep,
  isUndefined,
  isNull,
  isFunction
} = require('lodash');
const safeStringify = require('fast-safe-stringify');

class Cabin {
  constructor(config) {
    this.config = Object.assign(
      {
        logger: console,
        userFields: ['id', 'email', 'full_name']
      },
      config
    );
    autoBind(this);
  }

  // inspired by raven's parseRequest
  // eslint-disable-next-line complexity
  getMeta(req) {
    const headers = req.headers || req.header || {};
    const method = req.method || '';
    const host = req.hostname || req.host || headers.host || '';
    const protocol =
      req.protocol === 'https' || req.secure || (req.socket || {}).encrypted
        ? 'https'
        : 'http';
    const originalUrl = req.originalUrl || req.url || '';
    const absoluteUrl = `${protocol}://${host}${originalUrl}`;
    const query = req.query || url.parse(originalUrl || '', true).query;
    const cookies = cookie.parse(headers.cookie || '');
    const user = {};

    const ip = req.ip || (req.connection && req.connection.remoteAddress);
    if (ip) user.ip_address = req.ip;

    let body = ['GET', 'HEAD'].includes(method) ? '' : req.body;

    if (!isUndefined(body) && !isNull(body) && !isString(body))
      body = safeStringify(body);

    if (isObject(req.user)) {
      const obj = isFunction(req.user.toObject)
        ? req.user.toObject()
        : cloneDeep(req.user);
      this.config.userFields.forEach(field => {
        if (!isUndefined(obj[field]) && !isNull(obj[field]))
          user[field] = obj[field];
      });
    }

    return {
      request: {
        method,
        query,
        headers,
        cookies,
        body,
        url: absoluteUrl
      },
      user
    };
  }

  middleware(ctx, next, ...args) {
    const req = isObject(ctx) && isObject(ctx.request) ? ctx.request : ctx;
    const { logger } = this.config;
    const { getMeta } = this;
    // express support
    if (args[0] && isFunction(args[0])) next = args[0];
    // level, message, meta
    ctx.logger = function(...args) {
      if (isUndefined(args[3]) || isNull(args[3])) args[3] = {};
      if (isObject(args[3])) Object.assign(args[3], getMeta(req));
      logger[args[0]](...[].slice.call(args).slice(1));
    };
    // shorthand method
    ctx.log = ctx.logger;
    Object.keys(logger).forEach(key => {
      ctx.logger[key] = function(...args) {
        args.unshift(key);
        ctx.logger(...args);
      };
    });
    return next();
  }
}

module.exports = Cabin;
