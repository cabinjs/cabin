const process = require('node:process');
const c = require('ansi-colors');
const clfDate = require('clf-date');
const ms = require('ms');

// https://github.com/cabinjs/request-received
const requestReceivedStartTime = Symbol.for('request-received.startTime');
const pinoHttpStartTime = Symbol.for('pino-http.startTime');

function getStartTime(request) {
  let startTime = new Date();
  if (request[requestReceivedStartTime] instanceof Date)
    startTime = request[requestReceivedStartTime];
  else if (typeof request[requestReceivedStartTime] === 'number')
    startTime = new Date(request[requestReceivedStartTime]);
  else if (request[pinoHttpStartTime])
    startTime = new Date(request[pinoHttpStartTime]);
  else if (request._startTime instanceof Date) startTime = request._startTime;
  else if (typeof request._startTime === 'number')
    startTime = new Date(request._startTime);
  return startTime;
}

function apacheCommonLogFormat(options) {
  const { req, res, ctx } = options;

  const startTime = getStartTime(req);

  return `${ctx ? ctx.ip : req.ip} - ${clfDate(startTime)} "${req.method} ${
    req.url
  } HTTP/${req.httpVersionMajor}.${req.httpVersionMinor}" ${res.statusCode} ${
    res.getHeader('content-length') || '-'
  }`;
}

function devFriendlyLogFormat(options) {
  const { req, res, ctx } = options;

  const statusColor =
    res.statusCode >= 500
      ? 'red'
      : res.statusCode >= 400
        ? 'yellow'
        : res.statusCode >= 300
          ? 'cyan'
          : res.statusCode >= 200
            ? 'green'
            : 'white';

  let responseTime = '-';

  const responseTimeHeader = res.getHeader('x-response-time');
  if (responseTimeHeader) {
    const milliseconds = ms(responseTimeHeader);
    const responseColor =
      milliseconds >= 1000
        ? 'red'
        : milliseconds >= 500
          ? 'magenta'
          : milliseconds >= 250
            ? 'yellow'
            : milliseconds >= 100
              ? 'cyan'
              : 'green';
    responseTime = c[responseColor](`${milliseconds} ms`);
  }

  return [
    ctx ? ctx.ip : req.ip,
    req.method,
    req.url,
    `HTTP/${req.httpVersionMajor}.${req.httpVersionMinor}`,
    c[statusColor](res.statusCode),
    res.getHeader('content-length') || '-',
    '-',
    responseTime
  ].join(' ');
}

// https://stackoverflow.com/questions/9234699/understanding-apaches-access-log
module.exports = (options) => {
  // Apache Common Log Format
  // <https://httpd.apache.org/docs/current/logs.html#common>
  // :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]
  if (process.env.NODE_ENV === 'production')
    return apacheCommonLogFormat(options);

  // Dev-Friendly Log Format
  // :remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms
  return devFriendlyLogFormat(options);
};
