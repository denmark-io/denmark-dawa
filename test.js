/* eslint quotes:0 */

'use strict';
'use strong';

const DAWARequest = require('./dawa.js');
const endpoint = require('endpoint');
const test = require('tap').test;

test('single item returned', { timeout: Infinity }, function (t) {
  new DAWARequest('/postnumre/2800')
    .pipe(endpoint({ objectMode: true }, function (err, items) {
      t.ifError(err);

      t.equal(items.length, 1);
      t.deepEqual(items[0], {
        "href": "http://dawa.aws.dk/postnumre/2800",
        "nr": "2800",
        "navn": "Kgs. Lyngby",
        "stormodtageradresser": null,
        "kommuner": [
          {
            "href": "http://dawa.aws.dk/kommuner/157",
            "kode": "0157",
            "navn": "Gentofte"
          },
          {
            "href": "http://dawa.aws.dk/kommuner/159",
            "kode": "0159",
            "navn": "Gladsaxe"
          },
          {
            "href": "http://dawa.aws.dk/kommuner/173",
            "kode": "0173",
            "navn": "Lyngby-Taarbæk"
          },
          {
            "href": "http://dawa.aws.dk/kommuner/230",
            "kode": "0230",
            "navn": "Rudersdal"
          }
        ]
      });

      t.end();
    }));
});

test('bad url', function (t) {
  new DAWARequest('postnumre/2800')
    .pipe(endpoint({ objectMode: true }, function (err, items) {
      t.equal(err.name, 'Error');
      t.equal(err.message, 'unregnoized error (couldn\'t parse JSON)');
      t.equal(items.length, 0);
      t.end();
    }));
});

test('bad id', function (t) {
  new DAWARequest('/postnumre/01')
    .pipe(endpoint({ objectMode: true }, function (err, items) {
      t.equal(err.name, 'ResourceNotFoundError');
      t.equal(err.message, 'The resource was not found [nr: 1]');
      t.deepEqual(err.details, { nr: 1 });
      t.equal(items.length, 0);
      t.end();
    }));
});

test('multiply item returned', { timeout: Infinity }, function (t) {
  new DAWARequest('/postnumre', { kommunekode: '0157' })
    .pipe(endpoint({ objectMode: true }, function (err, items) {
      t.ifError(err);

      t.equal(items.length, 6);
      t.deepEqual(items, [{
        "href": "http://dawa.aws.dk/postnumre/2800",
        "nr": "2800",
        "navn": "Kgs. Lyngby",
        "stormodtageradresser": null,
        "kommuner": [
          {
            "href": "http://dawa.aws.dk/kommuner/157",
            "kode": "0157",
            "navn": "Gentofte"
          },
          {
            "href": "http://dawa.aws.dk/kommuner/159",
            "kode": "0159",
            "navn": "Gladsaxe"
          },
          {
            "href": "http://dawa.aws.dk/kommuner/173",
            "kode": "0173",
            "navn": "Lyngby-Taarbæk"
          },
          {
            "href": "http://dawa.aws.dk/kommuner/230",
            "kode": "0230",
            "navn": "Rudersdal"
          }
        ]
      }, {
        "href": "http://dawa.aws.dk/postnumre/2820",
        "nr": "2820",
        "navn": "Gentofte",
        "stormodtageradresser": null,
        "kommuner": [
          {
            "href": "http://dawa.aws.dk/kommuner/157",
            "kode": "0157",
            "navn": "Gentofte"
          },
          {
            "href": "http://dawa.aws.dk/kommuner/159",
            "kode": "0159",
            "navn": "Gladsaxe"
          }
        ]
      }, {
        "href": "http://dawa.aws.dk/postnumre/2870",
        "nr": "2870",
        "navn": "Dyssegård",
        "stormodtageradresser": null,
        "kommuner": [
          {
            "href": "http://dawa.aws.dk/kommuner/157",
            "kode": "0157",
            "navn": "Gentofte"
          }
        ]
      }, {
        "href": "http://dawa.aws.dk/postnumre/2900",
        "nr": "2900",
        "navn": "Hellerup",
        "stormodtageradresser": null,
        "kommuner": [
          {
            "href": "http://dawa.aws.dk/kommuner/101",
            "kode": "0101",
            "navn": "København"
          },
          {
            "href": "http://dawa.aws.dk/kommuner/157",
            "kode": "0157",
            "navn": "Gentofte"
          }
        ]
      }, {
        "href": "http://dawa.aws.dk/postnumre/2920",
        "nr": "2920",
        "navn": "Charlottenlund",
        "stormodtageradresser": null,
        "kommuner": [
          {
            "href": "http://dawa.aws.dk/kommuner/157",
            "kode": "0157",
            "navn": "Gentofte"
          }
        ]
      }, {
        "href": "http://dawa.aws.dk/postnumre/2930",
        "nr": "2930",
        "navn": "Klampenborg",
        "stormodtageradresser": null,
        "kommuner": [
          {
            "href": "http://dawa.aws.dk/kommuner/157",
            "kode": "0157",
            "navn": "Gentofte"
          },
          {
            "href": "http://dawa.aws.dk/kommuner/173",
            "kode": "0173",
            "navn": "Lyngby-Taarbæk"
          }
        ]
      }]);

      t.end();
    }));
});

test('https support', function (t) {
  new DAWARequest('/postnumre/01', {}, { protocol: 'https' })
    .pipe(endpoint({ objectMode: true }, function (err, items) {
      t.equal(err.name, 'ResourceNotFoundError');
      t.equal(err.message, 'The resource was not found [nr: 1]');
      t.deepEqual(err.details, { nr: 1 });
      t.equal(items.length, 0);
      t.end();
    }));
});
