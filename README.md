# fluent-openapi

[![Build Status][build]](https://travis-ci.org/silasbw/fluent-openapi) [![Greenkeeper badge][greenkeeper]](https://greenkeeper.io/)

[greenkeeper]: https://badges.greenkeeper.io/silasbw/fluent-openapi.svg
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

`options.getNames(name, ancestors)` - a function to translate each
path name to an alternate name or array of names. You could, for
example, alias the resource "namespaces" to "namespace" and "ns".
