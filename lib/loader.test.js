/* eslint-env mocha */
const { expect } = require('chai')

const Component = require('./loader')

describe('list.loader', () => {
  describe('Loader', () => {
    it('creates a dynamically generated component synchronously from swagger spec', () => {
      const spec = {
        paths: {
          '/api/': {
            get: {
              operationId: 'getCoreAPIVersions'
            }
          }
        }
      }
      const component = new Component()
      component._addSpec(spec)
      expect(component.api.get).is.a('function')
    })

    it('expands Paths Object', () => {
      const spec = {
        paths: {
          '/foo/bar/': { },
          'baz/zab': { }
        }
      }
      const component = new Component()
      component._addSpec(spec)
      expect(component.foo).to.be.an('object')
      expect(component.foo.bar).to.be.an('object')
      expect(component.baz).to.be.an('object')
      expect(component.baz.zab).to.be.an('object')
    })

    it('adds operations defined by a Path Item Object', () => {
      const spec = {
        paths: {
          '/foo/bar/': {
            get: {
              operationId: 'fooBarGet'
            }
          }
        }
      }
      const component = new Component()
      component._addSpec(spec)
      expect(component.foo.bar.get).is.a('function')
    })

    it('represents Path Templating with functions', () => {
      const spec = {
        paths: {
          '/foo/{name}/bar': { },
          '/foo': {
            get: {
              operationId: 'fooGet'
            }
          }
        }
      }
      const component = new Component()
      component._addSpec(spec)
      expect(component.foo).is.a('function')
      expect(component.foo.get).is.a('function')
      expect(component.foo.getStream).is.a('function')

      expect(component.foo.bar).to.be.a('undefined')
      expect(component.foo).is.a('function')
      expect(component.foo('zoo').bar).is.a('object')
    })

    it('aliases resources', () => {
      const spec = {
        paths: {
          '/foo/bars': {
            get: {
              operationId: 'fooBarsGet'
            }
          }
        }
      }
      const getNames = split => {
        if (split === 'bars') return [ 'bar', 'bars', 'b' ]
        return [ split ]
      }
      const component = new Component({ getNames })
      component._addSpec(spec)
      expect(component.foo.bars).to.be.an('object')
      expect(component.foo.bar).to.be.an('object')
      expect(component.foo.b).to.be.an('object')
    })
  })
})
