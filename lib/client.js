/* eslint-disable no-sync */

const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const Component = require('./loader')
const Request = require('./request')

class Client {
  constructor (options) {
    const http = options.http || new Request(options.config)
    let spec = options.spec
    if (!spec && options.version) {
      const swaggerPath = path.join(
        __dirname,
        'specs',
        `swagger-${options.version}.json.gz`)
      spec = JSON.parse(zlib.gunzipSync(fs.readFileSync(swaggerPath)))
    }

    const root = new Component({ splits: [], http: http, getNames: options.getNames })
    if (spec) root._addSpec(spec)
    return root
  }
}

module.exports = Client
