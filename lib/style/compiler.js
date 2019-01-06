// const path = require('path')
const postcss = require('postcss')
const validateOptions = require('schema-utils')
const { getOptions } = require('loader-utils')

const scopedPlugin = require('./plugin/scoped')

const schema = {
  type: 'object',
  properties: {
    moduleId: {
      type: 'string'
    },
    scoped: {
      type: 'boolean'
    },
    labelType: {
      type: 'string'
    }
  }
}

module.exports = function (style) {
  this.cacheable()
  const cb = this.async()
  let webpackOpts = getOptions(this) || {}
  validateOptions(schema, webpackOpts, 'Style Compiler Loader')
  if (!webpackOpts.scoped) {
    cb(null, style)
    return null
  }

  postcss([scopedPlugin({ id: webpackOpts.id })])
    .process(style, { from: undefined })
    .then(result => {
      const map = result.map && result.map.toJSON()
      cb(null, result.css, map)
      return null // silence bluebird warning
    })
    .catch(err => {
      console.error(err)
      cb(err)
    })
}
