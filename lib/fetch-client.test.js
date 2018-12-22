/* eslint-env mocha */
const { expect } = require('chai')
const fetch = require('node-fetch')
const nock = require('nock')

const FetchClient = require('./fetch-client')

const url = 'https://foo.com'

describe('lib.fetch-client', () => {
  describe('FetchClient', () => {
    it('GETs the expected value', done => {
      const client = new FetchClient({ fetch, url })

      nock(url)
        .get('/magic')
        .reply(200, {
          message: 'ta dah'
        })

      client.http({
        method: 'GET',
        pathname: 'magic'
      }).then(response => {
        expect(response.status).to.equal(200)
        return response.json()
      }).then(body => {
        expect(body).to.deep.equal({ message: 'ta dah' })
        done()
      })
    })

    it('POSTs the expected value', done => {
      const client = new FetchClient({ fetch, url })

      nock(url)
        .post('/magic', {
          message: 'ta dah'
        })
        .reply(204)

      client.http({
        body: { message: 'ta dah' },
        method: 'POST',
        pathname: 'magic'
      }).then(response => {
        expect(response.status).to.equal(204)
        done()
      })
    })
  })
})
