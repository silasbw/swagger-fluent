/* eslint-disable no-sync */

/**
 * @file Convert a OpenAPI/Swagger specification into a API client.
 *
 * Represent Swagger a Path Item Object [1] with chains of objects:
 *
 *   /api/v1/namespaces -> api.v1.namespaces
 *
 * Associate operations on a Path Item Object with functions:
 *
 *   GET /api/v1/namespaces -> api.v1.namespaces.get()
 *
 * Represent Path Templating [2] with function calls:
 *
 *   /api/v1/namespaces/{namespace}/pods -> api.v1.namespaces(namespace).pods
 *
 * Iterate over a Paths Object [3] to generate whole API client.
 *
 * [1]: https://swagger.io/specification/#pathItemObject
 * [2]: https://swagger.io/specification/#pathTemplating
 * [3]: https://swagger.io/specification/#pathsObject
 */

 const merge = require('deepmerge')
 const isPlainObject = require('is-plain-object')
 
 class Endpoint {
   /**
    * Internal representation of a Swagger Path Item Object.
    * @param {object} options - Options object
    * @param {string} options.name - Path Item Object name
    * @param {array} options.splits - Pathname pieces split in '/'
    * @param {object} options.pathItem - Swagger Path Item Object.
    */
   constructor (options) {
     this.name = options.name
     this.splits = options.splits
     this.pathItem = options.pathItem
   }
 }
 
 class Component {
   /**
    * Represents a single path split, child Components, and potentially a Path
    * Item Object.
    * @param {object} options - Options object
    * @param {object} options.http - Request object
    * @param {array} options.splits - Absolute pathname (split on '/')
    * @param {string} options.parameters - Path Template values for parents
    * @param {string} options.template - Optional Path Template (e.g., {name})
    */
   constructor (options) {
     options = Object.assign({ splits: [], parameters: [] }, options)
     let component
 
     //
     // Support Path Templating: use a function to create a a Component-like
     // object if required. Otherwise use a vanilla object (that isn't callable).
     //
     if (options.templated) {
       component = name => {
         const splits = component.splits.concat([name])
         //
         // Assume that we'll never have a path with adjacent templates.
         // E.g., assume `/foo/{name}/{property}` cannot exist.
         //
         const namedComponent = new this.constructor({
           backend: component.backend,
           getNames: options.getNames,
           splits: splits,
           parameters: options.parameters.concat([name])
         })
         component.templatedEndpoints.forEach(child => {
           namedComponent._addEndpoint(child)
         })
         return namedComponent
       }
       component.templatedEndpoints = []
 
       //
       // Attach methods
       //
       Object.setPrototypeOf(component, this.constructor.prototype)
     } else {
       component = this
       component.templatedEndpoints = null
     }
 
     component.parameters = options.parameters
     component.templated = options.templated
     component.splits = options.splits.slice()
     component.backend = options.backend
     component.getNames = options.getNames || (split => [split])
     component.children = []
     return component
   }
 
   /**
    * Get the path.
    * @returns {string} path with '/' as the separator.
    */
   getPath () {
     return `/${this.splits.join('/')}`
   }
 
   /**
    * Return an object of pathname parameters.
    * @returns {object} object mapping each parameter name to its value.
    */
   getPathnameParameters () {
     const pathnameParameterNames = this.swaggerName
       .split('/')
       .filter(component => component.startsWith('{'))
       .map(component => component.slice(1, -1))
 
     return pathnameParameterNames.reduce((acc, value, index) => {
       acc[value] = this.parameters[index]
       return acc
     }, {})
   }
 
   /**
    * Add endpoints defined by a swagger spec to this component. You would
    * typically call this only on the root component to add API resources. For
    * example, during client initialization, to extend the client with CRDs.
    * @param {object} spec - Swagger specification
    */
   _addSpec (spec) {
     //
     // TODO(sbw): It's important to add endpoints with templating before adding
     // any endpoints with paths that are subpaths of templated paths.
     //
     // E.g., add /api/v1/namepaces/{namespace} before adding /api/v1/namepaces
     //
     // This is important because ._addEndpoint constructs Component objects on
     // demand, and Component requires specifying if it's templated or not. If we
     // cause ._addEndpoint to construct a un-templated Component, templated
     // operations that share the Components subpath will not work.
     //
     Object.keys(spec.paths)
       .map(name => {
         const leadingAndTrailingSlashes = /(^\/)|(\/$)/g
         const splits = name.replace(leadingAndTrailingSlashes, '').split('/')
         return new Endpoint({ name, splits, pathItem: spec.paths[name] })
       })
       .sort((endpoint0, endpoint1) => {
         return endpoint1.splits.length - endpoint0.splits.length
       }).forEach(endpoint => {
         this._addEndpoint(endpoint)
       })
   }
 
   _addChild (split, component) {
     this.getNames(split, this.splits).forEach(name => {
       this[name] = component
       this.children.push(name)
     })
   }
 
   _walkSplits (endpoint) {
     const splits = this.splits.slice()
     // This splits an endpoint on the '/' character. 
     // Example: /apis/custom.metrics.k8s.io/v1beta1/{resource}/{name}/{subresource}
     // Splits would be: api, custom.metrics.k8s.io, v1beta1, resource, name, subresource
     const nextSplits = endpoint.splits.slice()
 
     let parent = this
     while (nextSplits.length) {
       const split = nextSplits.shift()
       splits.push(split)
 
       let template = null
       if (nextSplits.length && nextSplits[0].startsWith('{')) {
         template = nextSplits.shift().slice(1, -1)
       }

       // Example: '/apis/custom.metrics.k8s.io/v1beta1/namespaces/{namespace}/{resource}/{name}/{subresource}'
       // Checks if current split, such as 'v1beta' is already in the parent object, i.e
       // 'custom.metrics.k8s.io'
       // If it isn't, we construct an object and add 'v1beta' along with the params
       // as a child of 'custom.metrics.k8s.io'.
       // In this example, it would add a child under 'v1beta1' for 'namespaces'
       if (!(split in parent)) {
         const component = new this.constructor({
           getNames: this.getNames,
           backend: this.backend,
           parameters: this.parameters,
           templated: Boolean(template),
           splits
         })
         parent._addChild(split, component)
       }
       // However, in case of new API endpoints such as "/apis/custom.metrics.k8s.io/v1beta1/{resource}/{name}/{subresource}", 
       // the 'this' object for 'v1beta1' should be switched from templated=false to templated=true,
       // since the next-split {resource} is a templated parameter.
       // The variable templatedEndpoints, whis is null for non-templated parents also has to be
       // switched to hold a list as we'll be pushing endpoints into it in this case.
       else if (!parent[split].templated  && Boolean(template)) {
        parent[split].templatedEndpoints = []
        parent[split].templated = true
       }
       parent = parent[split]

       //
       // Path Template: save it and walk it once the user specifies
       // the value.
       // Basically stop iteration when we encounter a {templated} path item
       //  and add the endpoint to the parent object at this point.
       if (template) {
         if (!parent.templated) {
          throw new Error('Created Component, but require templated one. Endpoint: ' + endpoint.name +
                          'This is a bug. Please report: ' +
                          'https://github.com/silasbw/fluent-openapi/issues')
         }
         parent.templatedEndpoints.push(new Endpoint({
           name: endpoint.name,
           splits: nextSplits,
           pathItem: endpoint.pathItem
         }))
         return null
       }
     }
     return parent
   }
 
   /**
    * Add an Endpoint by creating an object chain according to its pathname
    * splits; and adding operations according to the pathItem.
    * @param {Endpoint} endpoint - Endpoint object.
    * @returns {Component} Component object endpoint was added to.
    */
   _addEndpoint (endpoint) {
     const component = this._walkSplits(endpoint)
     if (!component) return null
     component.pathItemObject = endpoint.pathItem
     component.swaggerName = endpoint.name
 
     //
     // "Expose" operations by omitting the leading _ from the method name.
     //
     const supportedMethods = ['get', 'put', 'post', 'delete', 'patch']
 
     supportedMethods
       .filter(method => endpoint.pathItem[method])
       .forEach(method => {
         component[method] = component['_' + method]
         if (method === 'get') component.getStream = component._getStream
       })
 
     return component
   }
 
   /**
    * Invoke a REST method
    * @param {string} method - HTTP method
    * @param {ApiRequestOptions} options - Options object
    * @returns {(Promise|Stream)} Promise
    */
   _requestAsync (method, options) {
     return this.backend.http(Object.assign({
       method,
       pathItemObject: this.pathItemObject,
       pathname: this.getPath(),
       pathnameParameters: this.getPathnameParameters()
     }, options))
   }
 
   //
   // Supported operations.
   //
 
   /**
    * Invoke a GET request against the API server
    * @param {ApiRequestOptions} options - Options object.
    * @returns {Stream} Stream
    */
   _getStream (options) {
     return this._requestAsync('GET', Object.assign({ stream: true }, options))
   }
 
   /**
    * Invoke a GET request against the API server
    * @param {ApiRequestOptions} options - Options object.
    * @returns {Promise} Promise
    */
   _get (options) {
     return this._requestAsync('GET', options)
   }
 
   /**
    * Invoke a DELETE request against the API server
    * @param {ApiRequestOptions} options - Options object.
    * @returns {Promise} Promise
    */
   _delete (options) {
     return this._requestAsync('DELETE', options)
   }
 
   /**
    * Invoke a PATCH request against the API server
    * @param {ApiRequestOptions} options - Options object
    * @returns {Promise} Promise
    */
   _patch (options) {
     return this._requestAsync('PATCH', merge({
       headers: { 'content-type': 'application/strategic-merge-patch+json' }
     }, options, { isMergeableObject: isPlainObject }))
   }
 
   /**
    * Invoke a POST request against the API server
    * @param {ApiRequestOptions} options - Options object
    * @returns {Promise} Promise
    */
   _post (options) {
     return this._requestAsync('POST', merge({
       headers: { 'content-type': 'application/json' }
     }, options, { isMergeableObject: isPlainObject }))
   }
 
   /**
    * Invoke a PUT request against the API server
    * @param {ApiRequestOptions} options - Options object
    * @returns {Promise} Promise
    */
   _put (options) {
     return this._requestAsync('PUT', merge({
       headers: { 'content-type': 'application/json' }
     }, options, { isMergeableObject: isPlainObject }))
   }
 }
 
 module.exports = Component
 