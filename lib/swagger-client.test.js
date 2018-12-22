/* eslint-env mocha */
const { expect } = require('chai')
const sinon = require('sinon')

const SwaggerClient = require('./swagger-client')

describe('lib.swagger-client', () => {
  describe('SwaggerClient', () => {
    it('executes operation', done => {
      const swagger = { execute: sinon.spy(async () => 'some result') }
      const client = new SwaggerClient({ client: swagger })

      client.http({
        operationId: 'getFoo',
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
      })
    })
  })
})
