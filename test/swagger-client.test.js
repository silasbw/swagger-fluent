/* eslint-env mocha */
const { expect } = require('chai')
const nock = require('nock')

const common = require('./common')
const Client = require('../lib/client')

describe('lib.swagger-client', () => {
  describe('.Client', () => {
    describe('.get', () => {
      it('returns the result for 2XX', done => {
        nock(common.api.url)
          .get('/magic')
          .reply(200, {
            message: 'ta dah'
          })

        const options = {
          config: { url: common.api.url },
          spec: {
            paths: {
              '/magic': {
                get: {
                  operationId: 'getMagic'
                }
              }
            }
          }
        }
        const client = new Client(options)
        client.magic.get()
          .then(res => {
            expect(res.statusCode).is.equal(200)
            expect(res.body.message).is.equal('ta dah')
            done()
          })
          .catch(done)
      })

      it('throws an error on non-2XX', done => {
        nock(common.api.url)
          .get('/magic')
          .reply(404, {
            message: 'fail!'
          })

        const options = {
          config: { url: common.api.url },
          spec: {
            paths: {
              '/magic': {
                get: {
                  operationId: 'getMagic'
                }
              }
            }
          }
        }
        const client = new Client(options)
        client.magic.get()
          .then(() => {
            expect('Should not reach').is.falsy()
          })
          .catch(err => {
            expect(err.statusCode).is.equal(404)
            expect(err.message).is.equal('fail!')
            done()
          })
      })
    })

    describe('.constructor', () => {
      it('creates a dynamically generated client synchronously from swagger spec', () => {
        const options = {
          config: {},
          spec: {
            paths: {
              '/api/': {
                get: {
                  operationId: 'getCoreAPIVersions'
                }
              }
            }
          }
        }
        const client = new Client(options)
        expect(client.api.get).is.a('function')
      })

      it('expands Paths Object', () => {
        const spec = {
          paths: {
            '/foo/bar/': { },
            'baz/zab': { }
          }
        }
        const client = new Client({ spec, http: {} })
        expect(client.foo).to.be.an('object')
        expect(client.foo.bar).to.be.an('object')
        expect(client.baz).to.be.an('object')
        expect(client.baz.zab).to.be.an('object')
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
        const client = new Client({ spec, http: {} })
        expect(client.foo.bar.get).is.a('function')
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
        const client = new Client({ spec, http: {} })
        expect(client.foo).is.a('function')
        expect(client.foo.get).is.a('function')
        expect(client.foo.getStream).is.a('function')

        expect(client.foo.bar).to.be.a('undefined')
        expect(client.foo).is.a('function')
        expect(client.foo('zoo').bar).is.a('object')
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
        const client = new Client({ spec, http: {}, getNames })
        expect(client.foo.bars).to.be.an('object')
        expect(client.foo.bar).to.be.an('object')
        expect(client.foo.b).to.be.an('object')
      })
    })
  })
})
