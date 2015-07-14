
'use strict';
'use strong';

const util = require('util');

function RemoteError(info) {
  Error.captureStackTrace(this, RemoteError);

  this.name = info.type;
  this.message = info.title;
  this.details = info.details;

  const extra = formatDetails(this.details);
  if (extra.length > 0) {
    this.message += ' ' + extra;
  }
}
util.inherits(RemoteError, Error);
module.exports = RemoteError;

function formatDetails(details) {
  const std = standardizeDetails(details);
  const keys = Object.keys(std);
  if (keys.length === 0) return '';

  return '[' + keys.map(function (key) {
    return `${key}: ${std[key]}`;
  }).join(', ') + ']';
}

function standardizeDetails(details) {
  // [[key, val], ...]
  if (Array.isArray(details)) {
    const std = {};
    for (const param of details) std[param[0]] = param[1];
    return std;
  }
  // {key: val, ...}
  else if (util.isObject(details)) {
    return details;
  }
  // null, undefined ...
  else {
    return {};
  }
}
