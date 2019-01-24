// <https://lacke.mn/reduce-your-bundle-js-file-size/>
// <https://github.com/lodash/babel-plugin-lodash/issues/221>
const Axe = require('axe');
const isArray = require('lodash/isArray');
const isEmpty = require('lodash/isEmpty');
const isError = require('lodash/isError');
const isFunction = require('lodash/isFunction');
const isNull = require('lodash/isNull');
const isNumber = require('lodash/isNumber');
const isObject = require('lodash/isObject');
const isString = require('lodash/isString');
const isUndefined = require('lodash/isUndefined');
const parseErr = require('parse-err');
const parseRequest = require('parse-request');
const { oneLineTrim } = require('common-tags');

const middleware = require('./middleware');

class Cabin {
  constructor(config) {
    this.config = {
      key: '',
      axe: {},
      logger: null,
      meta: {},
      // <https://github.com/niftylettuce/parse-request>
      userFields: undefined,
      // <https://github.com/niftylettuce/parse-err>
      fields: [],
      message: oneLineTrim`
          {{ req.ip }}\u00A0
          [{{ req.id ? req.id : new Date().toUTCString() }}]\u00A0
          "
          {{ req.method }}\u00A0
          {{ req.url }}\u00A0
          HTTP/{{ req.httpVersionMajor }}.{{ req.httpVersionMinor }}
          "\u00A0
          {{ res.statusCode }}\u00A0
          {{ res.get('X-Response-Time') }}
        `,
      // <https://lodash.com/docs#template>
      templateSettings: {
        interpolate: /{{([\s\S]+?)}}/g
      },
      ...config
    };

    // override key with root key in case user forgot
    if (!isEmpty(this.config.axe) && this.config.key)
      this.config.axe.key = this.config.key;

    if (!isEmpty(this.config.axe))
      this.config.logger = new Axe(this.config.axe);
    else if (this.config.key)
      this.config.logger = new Axe({ key: this.config.key });

    if (!isObject(this.config.logger)) this.config.logger = new Axe();

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
    if (isFunction(middleware)) this.middleware = middleware.bind(this);

    // backwards compatibility with older `getMeta` method
    this.getMeta = parseRequest;

    // expose parseRequest and parseErr
    this.parseRequest = parseRequest;
    this.parseErr = parseErr;
  }

  parseArg(arg) {
    if (isUndefined(arg) || isNull(arg)) arg = {};
    if (isError(arg)) arg = { err: parseErr(arg, this.config.fields) };
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
}

Cabin.Axe = Axe;
Cabin.parseRequest = parseRequest;
Cabin.parseErr = parseErr;

module.exports = Cabin;
