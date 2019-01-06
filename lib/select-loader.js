const { getOptions } = require('loader-utils')

const { getComponents } = require('./selector')

module.exports = function (source) {
  this.cacheable()
  const {
    componentIdx,
    labelType,
    labelIdx
  } = getOptions(this) || {}
  let { component } = getComponents(source)
  let result
  if (componentIdx) {
    result = component[componentIdx][labelType]
  } else {
    result = component[labelType]
  }
  if (labelIdx) {
    result = result[labelIdx].code || ''
  } else {
    result = result.code || ''
  }
  return result
}
