const fs = require('fs')
const path = require('path')
const hash = require('hash-sum')
const prettier = require('prettier')
const { getOptions } = require('loader-utils')
const validateOptions = require('schema-utils')
const { getComponents } = require('./lib/selector')
const { generateScript } = require('./lib/generate')

const isProduction = process.env.NODE_ENV === 'production'

const schema = {
  type: 'object',
  properties: {
    punPrefix: {
      type: 'string'
    },
    debug: {
      type: 'boolean'
    },
    namespace: {
      type: 'string'
    }
  }
}

const prettierFormat = {
  parser: 'babylon',
  semi: false,
  singleQuote: true
}

const defaultOptions = {
  punPrefix: 'Pun',
  namespace: 'none',
  debug: false
}

const defaultNamespace = ['none', 'auto']

const getNamespace = (labelValue, configValue, resourcePath) => {
  let result = ''
  // 不能将 namespace 设置为默认值
  if (defaultNamespace.includes(labelValue)) {
    throw Error('Can not set the default value of namespace')
  }
  // 如果最终配置中的 namespace 是 'auto'， 将 namespace 转化为 .pun 文件的文件名
  if (configValue === 'auto') {
    let parser = path.parse(resourcePath)
    result = parser.name
  }
  // 如果最终配置中的 namespace 是 'none' 或非， 将 namespace 转化为 undefined
  if (configValue === 'none' || !configValue) {
    result = ''
  }
  // 如果 .pun 文件中存在 namespace, 覆盖配置中的值
  if (labelValue) {
    result = labelValue
  }
  return result
}

const getModuleId = (_compiler, resourcePath) => {
  const context = (_compiler && _compiler.context) || process.cwd()
  const shortFilePath = path.relative(context, resourcePath).replace(/^(\.\.[\\\/])+/, '')
  return 'data-v-' + hash(isProduction ? (shortFilePath + '\n' + content) : shortFilePath)
}

module.exports = function (source) {
  this._compiler.options.module.rules.forEach((item, index) => {
    console.log(index, item, index)
  })
  // console.log(1, this._compilation._buildingModules, 1)
  // for (let key of this._compilation._buildingModules.keys()) {
  //   let file = key.resource.split('?')[0]
  //   let extname = path.extname(file)
  //   if (extname === '.vue') {
  //     console.log(key)
  //     break
  //   }
  // }
  let webpackOpts = Object.assign({}, defaultOptions, getOptions(this) || {})
  validateOptions(schema, webpackOpts, 'Vue Pun Loader')
  let { component, namespace } = getComponents(source)
  webpackOpts.moduleId = getModuleId(this._compiler, this.resourcePath)
  webpackOpts.namespace = getNamespace(namespace, webpackOpts.namespace, this.resourcePath)
  let result = generateScript(component, webpackOpts, this.resourcePath)
  if (webpackOpts.debug) {
    fs.writeFileSync(
      `${this.resourcePath}.parser`,
      prettier.format(result, prettierFormat),
      'utf8'
    )
  }
  return result
}
