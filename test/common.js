/* eslint-env mocha */
const crypto = require('crypto')

const defaultName = process.env.NAMESPACE || 'integration-tests'
const defaultTimeout = process.env.TIMEOUT || 30000

function testing (type) {
  const t = process.env.TESTING || 'unit'
  return t.substr(0, 3) === type.substr(0, 3)
}

/**
 * Executes mocha's `before` hook if testing `type`.
 * @param {string} type - Test type (e.g., 'int', or 'unit')
 * @param {function} fn - Function to execute.
 */
function beforeTesting (type, fn) {
  if (testing(type)) { before(fn) }
}

/**
 * Executes mocha's `after` hook if testing `type`.
 * @param {string} type - Test type (e.g., 'int', or 'unit')
 * @param {function} fn - Function to execute.
 */
function afterTesting (type, fn) {
  if (testing(type)) { after(fn) }
}

/**
 * Executes mocha's `beforeEach` hook if testing `type`.
 * @param {string} type - Test type (e.g., 'int', or 'unit')
 * @param {function} fn - Function to execute.
 */
function beforeTestingEach (type, fn) {
  if (testing(type)) { beforeEach(fn) }
}

function only (types, message, fn) {
  if (typeof (types) === 'string') types = [types]
  for (const type of types) {
    if (testing(type)) {
      return it(message, fn)
    }
  }
  it.skip(message, fn)
}

function newName () {
  const buffer = crypto.randomBytes(16)
  return `${defaultName}-${buffer.toString('hex')}`
}

module.exports.api = {
  url: 'https://foo.com'
}

module.exports.defaultTimeout = defaultTimeout
module.exports.newName = newName
module.exports.testing = testing
module.exports.afterTesting = afterTesting
module.exports.beforeTesting = beforeTesting
module.exports.beforeTestingEach = beforeTestingEach
module.exports.only = only
module.exports.thirdPartyDomain = 'kubernetes-client.com'
module.exports.customResourceDomain = 'kubernetes-client.com'
