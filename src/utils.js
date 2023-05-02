function isNull(value) {
  return value === null;
}

function isUndefined(value) {
  return value === undefined;
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value) {
  return typeof value === 'string';
}

function isFunction(value) {
  return typeof value === 'function';
}

module.exports = {
  isNull,
  isUndefined,
  isObject,
  isString,
  isFunction
};
