#denmark-dawa [![Build Status](https://travis-ci.org/denmark-io/denmark-dawa.svg?branch=master)](https://travis-ci.org/denmark-io/denmark-dawa)

> A simple interface API for the DAWA service

## Installation

```sheel
npm install denmark-dawa
```

## Documentation

```javascript
DAWARequest = require('denmark-dawa')
```

[DAWA (Danmarks Adressers Web API)](http://dawa.aws.dk/) is a service provided
by the danish government, which exposes multiply APIs for getting address
related information. The API is very simple, make a GET request and get a
big JSON object.

However the naïve implementation is performance wise not optimal. This module does the following:

* Adds a `Accept-Encoding: gzip, deflate` header for data compression.
* Adds `&ndjson=` to the url to get a stream friendly interface and remove pretty printing.
* Detects errors and create custom error objects (http://dawa.aws.dk/generelt#fejlhaandtering).
* Parses the JSON as a stream and adds back pressure.

`DAWARequest` is a class constructor with the signature `DAWARequest(pathname, query, settings)`:

```javascript
// Gets zipcodes including special ones (stormodtagere)
const req = new DAWARequest('/postnumre', {
  stormodtagere: true
});

req.on('data', function (item) {
  console.log(`${item.nr}: ${item.navn}`); // 0800: Høje Taastrup
});

req.once('error', function (err) {
  throw err;
});
```

The `settings` object can be used to specify the protocol (http or https),
http is the default:

```javascript
const req = new DAWARequest('/postnumre', {
  stormodtagere: true
}, {
  protcol: 'https'
});
```

Note that this module doesn't support the pagination API that DAWA provides.
However it is kinda broken anyway since you can't beyond 400000 items. And
not really nessarry since the JSON is parsed as a stream. So just add
`{ per_side : 1000000 }` to the query object, to get all the requests.

If you think this is an issue, I would be happy to consider a pull request.
