const fs = require('fs')
const prettier = require('prettier')
const { getOptions } = require('loader-utils')
const validateOptions = require('schema-utils')
const { getComponentContent } = require('./lib/label-parser')
const { generateVue } = require('./lib/generate')

const schema = {
  type: 'object',
  properties: {
    punPrefix: {
      type: 'string'
    },
    debug: {
      type: 'boolean'
    }
  }
}

const prettierFormat = {
  parser: 'vue',
  semi: false,
  singleQuote: true
}

const defaultOptions = {
  punPrefix: 'Pun',
  debug: false
}

module.exports = function (source) {
  let webpackOpts = Object.assign({}, defaultOptions, getOptions(this) || {})
  validateOptions(schema, webpackOpts, 'Pun Loader')
  let component = getComponentContent(source)
  let result = generateVue(component, webpackOpts)
  if (webpackOpts.debug) {
    fs.writeFileSync(
      `${this.resourcePath}.parser`,
      prettier.format(result, prettierFormat),
      'utf8'
    )
  }
  return `module.exports = ${JSON.stringify(result).replace(/(\\)+/g, '\\')}`
}
