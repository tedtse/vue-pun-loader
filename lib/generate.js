const acorn = require('acorn')
const estraverse = require('estraverse')
const escodegen = require('escodegen')
const changeCase = require('change-case')
const path = require('path')

const { optionalHandler } = require('./vue-optional')
const util = require('./util')

let PunComponents = []
let vueDeclaration
let WebpackOptions
let ResourcePath

/**
 * 根据 pun 文件生成新的 js 文件
 * @method generateScript
 * @param {Object} component
 * @param {Object} webpackOpts
 */
exports.generateScript = (component, webpackOpts = {}, resourcePath) => {
  WebpackOptions = webpackOpts
  ResourcePath = resourcePath
  let code = ''
  let outerExportNodes = []
  let innerExportNodes = []
  let scriptsCode = []
  // 汇总内置组件
  collectExtraComponent(component)
  scriptsCode.push(...getScript(component))
  // 引入 pun 文件中各标签的代码，作代码示例
  scriptsCode.push(getCode(component))
  // 将代码汇总, 分离出 export default 以内和以外的代码, 并转化成 ast
  scriptsCode.forEach(c => {
    let ast = acorn.parse(c, {
      sourceType: 'module'
    })
    estraverse.traverse(ast, {
      enter (node, parent) {
        if (!parent || parent.type !== 'Program') {
          return
        }
        if (node.type === 'ExportDefaultDeclaration') {
          innerExportNodes.push(...node.declaration.properties)
        } else {
          outerExportNodes.push(node)
        }
      }
    })
  })
  code += generateOuterExportCode(outerExportNodes)
  code += generateExtraComponentScript()
  code += generateRequireStyle(component)
  code += `export default { ${generateInnerExportCode(innerExportNodes)} }`
  return code
}

/**
 * 是否要加入 import ... from 'vue'
 * @method getVueImportScript
 * @param {Array} importNodes
 */
const getVueImportScript = importNodes => {
  let code = ''
  let mustImportVue = false
  if (importNodes && importNodes.length) {
    mustImportVue = importNodes.every(node => {
      if (node.source.value === 'vue') {
        node.specifiers.some(spec => {
          if (spec.type === 'ImportDefaultSpecifier') {
            vueDeclaration = spec.local.name
            return true
          }
        })
        return false
      }
    })
  }
  if (PunComponents.length) {
    mustImportVue = true
  }
  if (!vueDeclaration) {
    vueDeclaration = 'Vue'
  }
  if (mustImportVue) {
    code = `import ${vueDeclaration} from 'vue';`
  }
  return code
}

/**
 * 遍历所有 component, 汇总内置组件
 * @method collectExtraComponent
 * @param {Object} component
 */
const collectExtraComponent = component => {
  PunComponents = []
  if (util.isObjectNull(component)) {
  } else if (util.isComponentObject(component)) {
    if (component.template.code || component.script.code) {
      let componentDeclaration = `${changeCase.pascalCase(
        WebpackOptions.punPrefix + 'Component' + changeCase.pascalCase(WebpackOptions.namespace)
      )}`
      PunComponents.push({
        scoped: component.scoped,
        name: componentDeclaration,
        template: component.template.code || '',
        script: component.script.code || ''
      })
    }
  } else {
    for (let [key, value] of Object.entries(component)) {
      if (!value.template.code && !value.script.code) {
        continue
      }
      let componentDeclaration = `${changeCase.pascalCase(
        WebpackOptions.punPrefix + 'Component' + changeCase.pascalCase(key) + changeCase.pascalCase(WebpackOptions.namespace)
      )}`
      PunComponents.push({
        scoped: component.scoped,
        name: componentDeclaration,
        template: value.template.code || '',
        script: value.script.code || ''
      })
    }
  }
}

/**
 * 获取 component 对象中 script 标签的代码
 * @method getScript
 * @param {Object} component
 */
const getScript = component => {
  let result = []
  if (util.isObjectNull(component)) {
  } else if (util.isComponentObject(component)) {
    result.push(getLabelCode(component.script))
  } else {
    for (let v of Object.values(component)) {
      result.push(getLabelCode(v.script))
    }
  }
  return result
}

/**
 * 生成代码示例
 * @param {Object} component
 */
const getCode = component => {
  let result = {}
  if (util.isObjectNull(component)) {
  } else if (util.isComponentObject(component)) {
    result = {
      template: getLabelCode(component.template),
      script: getLabelCode(component.script),
      style: getLabelCode(component.style)
    }
  } else {
    for (let [k, v] of Object.entries(component)) {
      result[k] = {
        template: getLabelCode(v.template),
        script: getLabelCode(v.script),
        style: getLabelCode(v.style)
      }
    }
  }
  return `
    export default {
      data () {
        return {
          ${changeCase.camelCase(
            WebpackOptions.punPrefix + 'Code' + changeCase.pascalCase(WebpackOptions.namespace)
          )}: ${JSON.stringify(result)}
        }
      }
    }
  `
}

/**
 * 获取 label 对象中的 code 值
 * @method getLabelCode
 * @param {Object} label
 */
const getLabelCode = (label = {}) => {
  let result
  if (util.isLabelObject(label)) {
    result = label.code || ''
  } else {
    result = {}
    for (let [k, v] of Object.entries(label)) {
      result[k] = v.code || ''
    }
  }
  if (util.isObjectNull(result)) {
    result = ''
  }
  return result
}

/**
 * 将 export default 以外的 ast 转化为 script 代码
 * @method generateOuterExportCode
 * @param {Array} outerExportNodes
 */
const generateOuterExportCode = outerExportNodes => {
  let code = ''
  let { importNodes, notImportNodes } = util.parseNodeByImportDeclaration(outerExportNodes)
  importNodes.forEach(node => {
    code += escodegen.generate(node)
  })
  code += getVueImportScript(importNodes)
  notImportNodes.forEach(node => {
    code += escodegen.generate(node)
  })
  return code
}

/**
 * 将 export default 以内的 ast 转化为 script 代码
 * @method generateInnerExportCode
 * @param {Array} innerExportNodes
 * @param {Boolean} ignoreExtraComponent
 */
const generateInnerExportCode = (innerExportNodes, ignoreExtraComponent = false) => {
  let code = ''
  let optionalCollection = {}
  innerExportNodes.forEach(node => {
    if (node.type !== 'Property') {
      return
    }
    let key = node.key.name
    let value = node.value
    if (optionalCollection[key]) {
      optionalCollection[key].push(value)
    } else {
      optionalCollection[key] = [value]
    }
  })
  if (!optionalCollection.components) {
    optionalCollection.components = []
  }
  if (!ignoreExtraComponent) {
    let extraComponentAst = getExtraComponentAst()
    optionalCollection.components.push(extraComponentAst)
  }
  for (let [key, values] of Object.entries(optionalCollection)) {
    code += optionalHandler(key, values)
  }
  return code
}

/**
 * 生成内置组件代码
 * @method generateExtraComponentScript
 */
const generateExtraComponentScript = () => {
  let code = ''
  PunComponents.forEach(item => {
    code += `const ${item.name} = ${vueDeclaration}.extend({
      template: \`${generateTemplate(item.template, item.scoped, WebpackOptions.moduleId)}\`,
      ${generateOptionScript(item.script)}
    });`
  })
  return code
}

/**
 * 生成内置组件中的 optional
 * @method generateOptionScript
 * @param {String} code
 */
const generateOptionScript = code => {
  let innerExportNodes = []
  let ast = acorn.parse(code, {
    sourceType: 'module'
  })
  estraverse.traverse(ast, {
    enter (node, parent) {
      if (!parent || parent.type !== 'Program') {
        return
      }
      if (node.type === 'ExportDefaultDeclaration') {
        innerExportNodes.push(...node.declaration.properties)
      }
    }
  })
  return generateInnerExportCode(innerExportNodes, true)
}

/**
 * 获取内置组件代码的 ast
 * @method getExtraComponentAst
 */
const getExtraComponentAst = () => {
  let result = {
    type: 'ObjectExpression',
    properties: []
  }
  PunComponents.forEach(item => {
    result.properties.push({
      type: 'Property',
      computed: false,
      kind: 'init',
      method: false,
      shorthand: true,
      key: {
        type: 'Identifier',
        name: item.name
      },
      value: {
        type: 'Identifier',
        name: item.name
      }
    })
  })
  return result
}

const generateRequireStyle = component => {
  let code = ''
  const _generateRequireStyle = (style, opts = {}) => {
    let _code = ''
    let { lang, scoped } = style.attrs
    if (scoped === undefined || scoped === null) {
      scoped = false
    } else {
      scoped = true
    }
    let _opts = { ...opts, scoped }
    let preCompilerLoader = util.getPreCompilerLoader(lang)
    _code = 'require(\'!!vue-style-loader'
      + '!css-loader?{"sourceMap":' + !!WebpackOptions.cssSourceMap + '}'
      + (preCompilerLoader ? '!' + preCompilerLoader : '')
      + '!' + path.relative(path.dirname(ResourcePath), path.resolve(__dirname, 'style/compiler.js')) + '?' + JSON.stringify(_opts)
      + '!' + path.relative(path.dirname(ResourcePath), path.resolve(__dirname, 'select-loader.js')) + '?' + JSON.stringify(_opts)
      + '!' + ResourcePath + '\');'
    return _code
  }
  const traverseStyle = (style, opts = {}) => {
    let result = ''
    if (util.isObjectNull(style)) {
      return result
    } else if (util.isLabelObject(style)) {
      result += _generateRequireStyle(style, {
        ...opts,
        labelType: 'style',
        id: WebpackOptions.moduleId
      })
    } else {
      for (let [index, sty] of Object.entries(style)) {
        if (isNaN(index)) {
          continue
        }
        result += _generateRequireStyle(sty, {
          ...opts,
          labelType: 'style',
          styleIdx: index,
          id: WebpackOptions.moduleId
        })
      }
    }
    return result
  }
  if (util.isObjectNull(component)) {
    return code
  } else if (util.isComponentObject(component)) {
    code += traverseStyle(component.style)
  } else {
    for (let [index, comp] of Object.entries(component)) {
      if (isNaN(index)) {
        continue
      }
      code += traverseStyle(comp.style, {
        componentIdx: index
      })
    }
  }
  return code
}

const generateTemplate = (template, scoped, moduleId) => {
  let result = require('../lib/template/compiler')(template, scoped, moduleId)
  return result
}
