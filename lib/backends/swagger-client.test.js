/* eslint-env mocha */
const { expect } = require('chai')
const sinon = require('sinon')

const SwaggerClient = require('./swagger-client')

describe('lib.backends.swagger-client', () => {
  describe('SwaggerClient', () => {
    it('executes operation', done => {
      const swagger = { execute: sinon.spy(() => Promise.resolve('some result')) }
      const client = new SwaggerClient({ client: swagger })

      client.http({
        method: 'GET',
        pathItemObject: { get: { operationId: 'getFoo' } },
        body: { a: 1 },
        parameters: { b: 2 },
        pathnameParameters: { c: 3 }
      }).then(() => {
        expect(swagger.execute.called).is.equal(true)
        expect(swagger.execute.calledWith({
          operationId: 'getFoo',
          parameters: {
            a: 1,
            b: 2,
            c: 3
          }
        })).to.be.equal(true)
        done()
      }).catch(done)
    })

    it('executes operation without operationId', done => {
      const swagger = { execute: sinon.spy(() => Promise.resolve('some result')) }
      const client = new SwaggerClient({ client: swagger })

      client.http({
        method: 'GET',
        pathname: '/api/v2/foo',
        pathItemObject: { get: { } },
        body: { a: 1 },
        parameters: { b: 2 },
        pathnameParameters: { c: 3 }
      }).then(() => {
        expect(swagger.execute.called).is.equal(true)
        expect(swagger.execute.getCall(0).args).to.deep.equal([{
          pathName: '/api/v2/foo',
          method: 'GET',
          parameters: {
            a: 1,
            b: 2,
            c: 3
          }
        }])
        done()
      }).catch(done)
    })
  })
})
