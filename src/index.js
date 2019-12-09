const Axe = require('axe');
const isError = require('iserror');
const parseErr = require('parse-err');

const {
  isEmpty,
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
    this.config = Object.assign(
      {
        key: '',
        capture: null,
        axe: {},
        logger: null,
        meta: {},
        // <https://github.com/niftylettuce/parse-request>
        parseRequest: {},
        // <https://github.com/niftylettuce/parse-err>
        errorProps: [],
        // function that accepts (level, req, res) and returns a string
        // (this is consumed by the cabin middleware and not available in browsers)
        message
      },
      config
    );

    // override key with root key in case user forgot
    if (!isEmpty(this.config.axe) && this.config.key)
      this.config.axe.key = this.config.key;

    if (!isEmpty(this.config.axe) && typeof this.config.capture === 'boolean')
      this.config.axe.capture = this.config.capture;

    if (!isEmpty(this.config.axe))
      this.config.logger = new Axe(this.config.axe);
    else if (this.config.key || this.config.capture)
      this.config.logger = new Axe(
        Object.assign(
          this.config.key ? { key: this.config.key } : {},
          this.config.capture ? { capture: this.config.capture } : {}
        )
      );
    else if (!isObject(this.config.logger)) this.config.logger = new Axe();

    // bind the logger
    this.logger = this.config.logger;

    // parse arg helper
    this.parseArg = this.parseArg.bind(this);

    // bind helper functions for each log level
    Object.keys(this.logger)
      .filter(key => isFunction(this.logger[key]))
      .forEach(level => {
        this[level] = (...args) => {
          if (args[1]) args[1] = this.parseArg(args[1]);
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
    if (isFunction(middleware)) this.middleware = middleware.bind(this);
  }

  parseArg(arg = {}) {
    if (isObject(arg)) {
      arg = Object.assign(arg, this.config.meta);
      return arg;
    }

    if (isUndefined(arg) || isNull(arg)) arg = {};
    else if (isError(arg)) arg = { err: parseErr(arg, this.config.errorProps) };
    else if (Array.isArray(arg)) arg = { value: arg };
    else if (isString(arg)) arg = { value: arg };
    else if (typeof arg === 'number') arg = { value: arg };
    else if (isFunction(arg)) arg = { value: arg.toString() };
    else arg = {};
    arg = Object.assign(arg, this.config.meta);
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
