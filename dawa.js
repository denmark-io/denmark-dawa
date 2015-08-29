
'use strict';
'use strong';

const url = require('url');
const util = require('util');
const zlib = require('zlib');
const stream = require('stream');
const extend = require('util-extend');
const endpoint = require('endpoint');

const Parser = require('stream-json/Parser');
const Streamer = require('stream-json/Streamer');
const Packer = require('stream-json/Packer');
const StreamArray = require('stream-json/utils/StreamArray');

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

  settings = extend({ protocol: 'http' }, settings);
  query = extend({ noformat: '' }, query);

  const href = {
    hostname: hostname,
    path: url.format({pathname, query}),
    headers: {
      'Accept-Encoding': 'gzip, deflate'
    }
  };

  this._parser = new Parser();
  this._parser
    .pipe(new Streamer())
    .pipe(new Packer({
      packKeys: true,
      packStrings: true,
      packNumbers: true
    }))
    .pipe(new StreamArray())
    .pipe(this);

  this._req = request[settings.protocol](href);
  this._req.on('error', this.emit.bind(this, 'error'));
  this._req.once('response', this._handleResponse.bind(this));
}
module.exports = DAWARequest;
util.inherits(DAWARequest, stream.Transform);

DAWARequest.prototype._transform = function (chunk, encoding, done) {
  this.push(chunk.value);
  done(null);
};

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
    this._parseStream(content);
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

DAWARequest.prototype._parseStream = function (content) {
  const self = this;

  content.once('readable', function () {
    let firstchar = content.read(1);
    content.unshift(firstchar);
    firstchar = firstchar.toString();

    if (firstchar === '{') {
      content.pipe(endpoint(function (err, content) {
        if (err) return self.emit('error', err);
        self.push(JSON.parse(content));
        self.push(null);
      }));
    } else if (firstchar === '[') {
      content.on('error', self.emit.bind(self, 'error'));
      content.pipe(self._parser);
    } else {
      self.emit('error',
        new TypeError('Unregnoized json format, first char: ' + firstchar));
    }
  });
};
