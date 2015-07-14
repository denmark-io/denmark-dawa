
'use strict';
'use strong';

const url = require('url');
const util = require('util');
const zlib = require('zlib');
const stream = require('stream');
const extend = require('util-extend');
const endpoint = require('endpoint');

const request = {
  http: require('http').get,
  https: require('https').get
};

const RemoteError = require('./lib/remote-error.js');
const Parser = require('./lib/parser.js');

const hostname = 'dawa.aws.dk';

function DAWARequest(pathname, query, settings) {
  if (!(this instanceof DAWARequest)) {
    return new DAWARequest(pathname, query, settings);
  }
  stream.Readable.call(this, { objectMode: true });

  const self = this;

  settings = extend({ protocol: 'http' }, settings);
  query = extend({ noformat: '' }, query);

  const href = {
    hostname: hostname,
    path: url.format({pathname, query}),
    headers: {
      'Accept-Encoding': 'gzip, deflate'
    }
  };

  this._res = null;
  this._parser = new Parser();
  this._parser.on('error', this.emit.bind(this, 'error'));
  this._parser.once('end', function () {
    self.push(null);
  });
  this._parser.on('item', function (item) {
    self.push(item);
    // Stop the flow of data, this._read will resume it
    self._res.pause();
  });

  this._req = request[settings.protocol](href);
  this._req.on('error', this.emit.bind(this, 'error'));
  this._req.once('response', this._handleResponse.bind(this));
}
module.exports = DAWARequest;
util.inherits(DAWARequest, stream.Readable);

DAWARequest.prototype._handleResponse = function (res) {
  const self = this;
  const content = unzip(res);

 // In case of error
  if (res.statusCode !== 200) {
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
  }
  // No Error
  else {
    this._res = res;
    this._res.on('error', this.emit.bind(this, 'error'));
    this._parser.stream(unzip(res));
  }
};

function unzip(res) {
  // or, just use zlib.createUnzip() to handle both cases
  switch (res.headers['content-encoding']) {
    case 'gzip': return res.pipe(zlib.createGunzip());
    case 'deflate': return res.pipe(zlib.createInflate());
    default: return res;
  }
}

DAWARequest.prototype._read = function () {
  // If res is null, then the request haven't been made yet
  // and since the stream isn't intially paused. Some data will
  // be emitted.
  if (this._res) this._res.resume();
};
