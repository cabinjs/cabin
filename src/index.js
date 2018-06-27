const Axe = require('axe');
const parseRequest = require('parse-request');
const parseErr = require('parse-err');

// <https://lacke.mn/reduce-your-bundle-js-file-size/>
// <https://github.com/lodash/babel-plugin-lodash/issues/221>
const isUndefined = require('lodash/isUndefined');
const isNull = require('lodash/isNull');
const isFunction = require('lodash/isFunction');
const isError = require('lodash/isError');
const isArray = require('lodash/isArray');
const isString = require('lodash/isString');
const isNumber = require('lodash/isNumber');
const isObject = require('lodash/isObject');
const isEmpty = require('lodash/isEmpty');

class Cabin {
  constructor(config) {
    this.config = Object.assign(
      {
        key: '',
        axe: {},
        logger: null,
        meta: {},
        // <https://github.com/niftylettuce/parse-request>
        userFields: ['id', 'email', 'full_name', 'ip_address'],
        // <https://github.com/niftylettuce/parse-err>
        fields: []
      },
      config
    );

    // override key with root key in case user forgot
    if (!isEmpty(this.config.axe) && this.config.key)
      this.config.axe.key = this.config.key;

    if (!isEmpty(this.config.axe))
      this.config.logger = new Axe(this.config.axe);
    else if (this.config.key)
      this.config.logger = new Axe({ key: this.config.key });

    if (!isObject(this.config.logger))
      throw new Error('Please specify a `logger` or pass an `axe` Object');

    // bind the logger
    this.logger = this.config.logger;

    // parse arg helper
    this.parseArg = this.parseArg.bind(this);

    // bind helper functions for each log level
    Object.keys(this.logger)
      .filter(key => isFunction(this.logger[key]))
      .forEach(level => {
        this[level] = (...args) => {
          args[1] = this.parseArg(args[1]);
          this.logger[level](...[].slice.call(args));
        };
      });

    // aliases
    this.err = this.error;
    this.warning = this.warn;

    // we'd use `auto-bind` package but unfortunately it
    // doesn't have a compiled version without `const` etc
    this.setMeta = this.setMeta.bind(this);
    this.setUser = this.setUser.bind(this);
    this.middleware = this.middleware.bind(this);

    // backwards compatibility with older `getMeta` method
    this.getMeta = parseRequest;

    // expose parseRequest and parseErr
    this.parseRequest = parseRequest;
    this.parseErr = parseErr;
  }

  parseArg(arg) {
    if (isUndefined(arg) || isNull(arg)) arg = {};
    if (isError(arg)) arg = parseErr(arg, this.config.fields);
    if (isArray(arg)) arg = { value: arg };
    if (isString(arg)) arg = { value: arg };
    if (isNumber(arg)) arg = { value: arg };
    if (isFunction(arg)) arg = { value: arg.toString() };
    if (!isObject(arg)) arg = {};
    Object.assign(arg, this.config.meta);
    return arg;
  }

  setMeta(meta = {}) {
    this.config.meta = meta;
  }

  setUser(user = {}) {
    this.config.meta.user = user;
  }

  middleware(ctx, next, ...args) {
    const req = isObject(ctx) && isObject(ctx.request) ? ctx.request : ctx;
    // express support
    if (!isUndefined(args[0]) && isFunction(args[0])) next = args[0];
    // callback fallback
    if (!isFunction(next)) next = () => {};
    ctx.logger = {};
    Object.keys(this.logger)
      .filter(key => isFunction(this.logger[key]))
      .forEach(key => {
        ctx.logger[key] = (...args) => {
          args[1] = this.parseArg(args[1]);
          Object.assign(args[1], parseRequest(req, this.config.userFields));
          this.logger[key](...[].slice.call(args));
        };
      });
    ctx.log = ctx.logger;
    return next();
  }
}

module.exports = Cabin;
