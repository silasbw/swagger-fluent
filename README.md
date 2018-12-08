# fluent-openapi

[![Build Status][build]](https://travis-ci.org/silasbw/fluent-openapi)

[build]: https://travis-ci.org/silasbw/fluent-openapi.svg?branch=master

A fluent client for OpenAPI and Swagger.

## Using

```js
const spec = require('./swagger.json')
const Client = require('fluent-openapi')
const client = new Client({ spec })
```

## API

### `Client(options)`

`options.getNames(split, splits)` - a callback to translate each path
name to an alternate name or set of names.
