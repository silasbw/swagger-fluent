'use strict'

class SwaggerClient {
  /**
   * {@link https://github.com/swagger-api/swagger-js Swagger Client} client
   * @param {object} options
   * @param {function} options.client - Instance of a Swagger.
   */
  constructor ({ client }) {
    this.client = client
  }

  /**
   * Invoke API request.
   * @param {object} options - options object.
   * @param {object} options.body - JSONifable object or undefined.
   * @param {string} options.method - HTTP method.
   * @param {string} optoins.operationId - Swagger/OpenAPI operation ID.
   * @param {object} options.parameters - named query parameters.
   * @param {object} options.qs - named query parameters (legacy).
   * @param {string} options.pathname - URL pathname.
   * @param {boolean} options.stream - true if called by a "stream method".
   */
  http (options) {
    const parameters = Object.assign(
      {},
      options.body,
      options.qs || options.parameters,
      options.pathnameParameters
    )

    return this.client.execute({
      operationId: options.operationId,
      parameters
    })
  }
}

module.exports = SwaggerClient
