const Axe = require('axe');
const format = require('@ladjs/format-util');
const formatSpecifiers = require('format-specifiers');
const isError = require('iserror');
const mergeOptions = require('merge-options');
const parseErr = require('parse-err');
const pkg = require('../package.json');
const {
  isNull,
  isUndefined,
  isObject,
  isString,
  isFunction
} = require('./utils');
const message = require('./message');
const middleware = require('./middleware');

class Cabin {
  constructor(config) {
    this.config = mergeOptions(
      {
        logger: console,
        meta: {},
        // <https://github.com/cabinjs/parse-request>
        parseRequest: {},
        // <https://github.com/cabinjs/parse-err>
        errorProps: [],
        // function that accepts (level, req, res) and returns a string
        // (this is consumed by the cabin middleware and not available in browsers)
        message,
        // expose a version for user agent
        version: pkg.version
      },
      config
    );

    if (!isObject(this.config.logger))
      throw new Error(
        'Logger option must be a logger object such as `console` or an instance of Axe'
      );

    if (!(this.config.logger instanceof Axe))
      this.config.logger = new Axe({ logger: this.config.logger });

    // parse arg helper
    this.parseArg = this.parseArg.bind(this);

    // bind helper functions for each log level
    for (const level of Object.keys(this.config.logger).filter((key) =>
      isFunction(this.config.logger[key])
    )) {
      this[level] = (...args) => {
        // support format specifiers
        if (
          typeof args[0] === 'string' &&
          formatSpecifiers.some((t) => args[0].includes(t)) &&
          args[1]
        ) {
          args[0] = format(args[0], args[1]);
          delete args[1];
        } else if (args[1]) args[1] = this.parseArg(args[1]);
        return this.config.logger[level](...Array.prototype.slice.call(args));
      };
    }

    // aliases
    this.err = this.error;
    this.warning = this.warn;

    // we'd use `auto-bind` package but unfortunately it
    // doesn't have a compiled version without `const` etc
    this.setMeta = this.setMeta.bind(this);
    this.setUser = this.setUser.bind(this);
    if (isFunction(middleware)) this.middleware = middleware.bind(this);
  }

  parseArg(arg = {}) {
    if (isObject(arg)) {
      Object.assign(arg, this.config.meta);
      return arg;
    }

    if (isUndefined(arg) || isNull(arg)) arg = {};
    else if (isError(arg)) arg = { err: parseErr(arg, this.config.errorProps) };
    else if (Array.isArray(arg)) arg = { value: arg };
    else if (isString(arg)) arg = { value: arg };
    else if (typeof arg === 'number') arg = { value: arg };
    else if (isFunction(arg)) arg = { value: arg.toString() };
    else arg = {};
    Object.assign(arg, this.config.meta);
    return arg;
  }

  setMeta(meta = {}) {
    this.config.meta = meta;
  }

  setUser(user = {}) {
    this.config.meta.user = user;
  }
}

module.exports = Cabin;
