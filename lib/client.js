const Component = require('./loader')

class Client {
  constructor (options) {
    const backend = options.backend
    if (!backend) throw new Error('expected "backend"')

    const root = new Component({ splits: [], backend, getNames: options.getNames })
    if (options.spec) root._addSpec(options.spec)
    return root
  }
}

module.exports = Client
