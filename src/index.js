const Axe = require('axe');
const parseRequest = require('parse-request');
const parseErr = require('parse-err');
const onFinished = require('on-finished');
const safeStringify = require('fast-safe-stringify');

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
const tmpl = require('lodash/template');
const { oneLineTrim } = require('common-tags');

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
        }
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
    this.middleware = this.middleware.bind(this);

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

  middleware(...args) {
    const isExpress = !isUndefined(args[2]) && isFunction(args[2]);
    const req = isExpress ? args[0] : args[0].req;
    const res = isExpress ? args[1] : args[0].res;
    const next = isExpress ? args[2] : args[1];
    const logger = {};
    Object.keys(this.logger)
      .filter(key => isFunction(this.logger[key]))
      .forEach(key => {
        logger[key] = (...args) => {
          args[1] = this.parseArg(args[1]);
          Object.assign(args[1], parseRequest(req, this.config.userFields));
          this.logger[key](...[].slice.call(args));
        };
      });
    // store a copy of the request body
    // in case we modified it in our middleware
    // (a common practice unfortunately)
    const body = safeStringify(req.body);
    // upon completion of a response we need to log it
    onFinished(res, (err, res) => {
      if (err) return logger.error(err);
      let level = 'info';
      if (res.statusCode >= 500) level = 'error';
      else if (res.statusCode >= 400) level = 'warn';
      logger[level](
        tmpl(this.config.message, {
          ...this.config.templateSettings
        })({
          req: {
            ...req,
            body
          },
          res: isExpress ? res : args[0].response
        }).trim()
      );
    });
    // add `log` (shorthand) and `logger` methods
    // `req.log`
    // `res.log`
    // `ctx.req`
    // `ctx.res`
    // `ctx.request`
    // `ctx.response`
    // <https://github.com/pinojs/koa-pino-logger/blob/master/logger.js#L11>
    // <https://github.com/pinojs/pino-http/blob/master/logger.js#L55>
    req.log = logger;
    res.log = logger;
    req.logger = logger;
    res.logger = logger;
    if (!isExpress) {
      const ctx = args[0];
      ctx.log = logger;
      ctx.logger = logger;
      ctx.request.log = logger;
      ctx.request.logger = logger;
      ctx.response.log = logger;
      ctx.response.logger = logger;
    }
    return next();
  }
}

Cabin.Axe = Axe;
Cabin.parseRequest = parseRequest;
Cabin.parseErr = parseErr;

module.exports = Cabin;
