/* eslint-env mocha */
const { expect } = require('chai')
const nock = require('nock')

const Client = require('../lib/client')

const url = 'https://foo.com'

describe('lib.client', () => {
  describe('.Client', () => {
    describe('.get', () => {
      it('returns the result for 2XX', done => {
        nock(url)
          .get('/magic')
          .reply(200, {
            message: 'ta dah'
          })

        const options = {
          config: { url },
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
        nock(url)
          .get('/magic')
          .reply(404, {
            message: 'fail!'
          })

        const options = {
          config: { url },
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
  })
})
