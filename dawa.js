
'use strict';
'use strong';

const url = require('url');
const util = require('util');
const zlib = require('zlib');
const stream = require('stream');
const endpoint = require('endpoint');
const ndjsonpoint = require('ndjsonpoint');

const RemoteError = require('./lib/remote-error.js');
const hostname = 'dawa.aws.dk';
const request = {
  http: require('http').get,
  https: require('https').get
};

function DAWARequest(pathname, query, settings) {
  if (!(this instanceof DAWARequest)) {
    return new DAWARequest(pathname, query, settings);
  }
  stream.Transform.call(this, { objectMode: true });

  settings = Object.assign({ protocol: 'http' }, settings);
  query = Object.assign({ ndjson: '' }, query);

  const href = {
    hostname: hostname,
    path: url.format({pathname, query}),
    headers: {
      'Accept-Encoding': 'gzip, deflate'
    }
  };

  this._req = request[settings.protocol](href);
  this._req.on('error', this.emit.bind(this, 'error'));
  this._req.once('response', this._handleResponse.bind(this));
}
module.exports = DAWARequest;
util.inherits(DAWARequest, stream.PassThrough);

function unzip(res) {
  // or, just use zlib.createUnzip() to handle both cases
  switch (res.headers['content-encoding']) {
    case 'gzip': return res.pipe(zlib.createGunzip());
    case 'deflate': return res.pipe(zlib.createInflate());
    default: return res;
  }
}

DAWARequest.prototype._handleResponse = function (res) {
  res.on('error', this.emit.bind(this, 'error'));
  const content = unzip(res);

  if (res.statusCode !== 200) {
    this._parseError(content);
  } else {
    content.pipe(ndjsonpoint()).pipe(this);
  }
};

DAWARequest.prototype._parseError = function (content) {
  const self = this;

  content.pipe(endpoint(function (err, data) {
    if (err) self.emit('error', err);

    let contentErr = null;
    try {
      contentErr = new RemoteError(JSON.parse(data));
    } catch (e) {
      contentErr = new Error('unregnoized error (couldn\'t parse JSON)');
    }
    self.emit('error', contentErr);
  }));
};
