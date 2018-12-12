/* eslint-env mocha */
const { expect } = require('chai')
const nock = require('nock')

const FetchClient = require('./fetch-client')

const url = 'https://foo.com'

describe('lib.fetch-client', () => {
  describe('FetchClient', () => {
    it('GETs the expected value', async () => {
      const client = new FetchClient({ url })

      nock(url)
        .get('/magic')
        .reply(200, {
          message: 'ta dah'
        })

      const response = await client.http({ method: 'GET', pathname: 'magic' })
      expect(response.status).to.equal(200)
      const body = await response.json()
      expect(body).to.deep.equal({ message: 'ta dah' })
    })

    it('POSTs the expected value', async () => {
      const client = new FetchClient({ url })

      nock(url)
        .post('/magic', {
          message: 'ta dah'
        })
        .reply(204)

      const response = await client.http({
        body: { message: 'ta dah' },
        method: 'POST',
        pathname: 'magic'
      })
      expect(response.status).to.equal(204)
    })
  })
})
