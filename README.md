#denmark-dawa

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
* Adds `&noformat=` to the url to avoid prettified JSON strings.
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

## Source

The source is: http://dawa.aws.dk/vejedok

This uses the autocomplete feature, with an empty search. This way a
minimal (in terms of size) response is obtained.

##License

**The software is license under "MIT"**

> Copyright (c) 2015 Andreas Madsen
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.
