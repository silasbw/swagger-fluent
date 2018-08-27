const Component = require('./loader')
const Request = require('./request')

class Client {
  constructor (options) {
    const http = options.http || new Request(options.config)
    const root = new Component({ splits: [], http: http, getNames: options.getNames })
    if (options.spec) root._addSpec(options.spec)
    return root
  }
}

module.exports = Client
