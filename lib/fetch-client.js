'use strict'

const fetch = require('node-fetch')
const { URL, URLSearchParams } = require('url')

class FetchClient {
  constructor (options) {
    this.url = options.url
  }

  /**
   * Invoke API request.
   * @param {object} options - options object.
   * @param {object} options.body - JSONifable object or undefined.
   * @param {string} options.method - HTTP method.
   * @param {object} options.parameters - named query parameters.
   * @param {object} options.qs - named query parameters (legacy).
   * @param {string} options.pathname - URL pathname.
   * @param {boolean} options.stream - true if called by a "stream method".
   */
  http (options) {
    const body = JSON.stringify(options.body)
    const url = new URL(this.url)
    url.pathname += options.pathname
    const searchParams = new URLSearchParams(options.parameters || options.qs)
    url.search = searchParams

    return fetch(url.href, {
      body,
      method: options.method
    })
  }
}

module.exports = FetchClient
