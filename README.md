# fluent-openapi

A fluent client for OpenAPI and Swagger

## Using

```js
cosnt spec = fs.readFileSync('./swagger.json')
const Client = require('fluent-openapi')
const client = new Client({ spec })
```

## API

### `Client(options)`

`options.getNames(split, splits)` - a callback to translate each path
name to an alternate name or set of names.
