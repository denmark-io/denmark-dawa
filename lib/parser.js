
'use strict';
'use strong';

const util = require('util');
const events = require('events');
const endpoint = require('endpoint');
const JSONStream = require('JSONStream');

function Parser() {
  this.parser = JSONStream.parse([true]);
  this.parser.on('error', this.emit.bind(this, 'error'));
  this.parser.on('data', this.emit.bind(this, 'item'));
  this.parser.once('end', this.emit.bind(this, 'end'));
}
util.inherits(Parser, events.EventEmitter);
module.exports = Parser;

Parser.prototype.stream = function (stream) {
  const self = this;

  stream.once('readable', function () {
    let firstchar = stream.read(1);
    stream.unshift(firstchar);
    firstchar = firstchar.toString();

    if (firstchar === '{') {
      stream.pipe(endpoint(function (err, content) {
        if (err) return self.emit('error', err);
        self.emit('item', JSON.parse(content));
        self.emit('end');
      }));
    } else if (firstchar === '[') {
      stream.on('error', self.emit.bind(self, 'error'));
      stream.pipe(self.parser);
    } else {
      self.emit('error',
        new TypeError('Unregnoized json type, first char: ' + firstchar));
    }
  });
};
