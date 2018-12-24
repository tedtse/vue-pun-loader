const acorn = require('acorn')
const estraverse = require('estraverse')
const escodegen = require('escodegen')
const changeCase = require('change-case')

const { optionalHandler } = require('./vue-optional')
const util = require('./util')

let punComponents = []
let vueDeclaration
let WebpackOptions

/**
 * 根据 pun 文件生成新的 vue 文件
 */
exports.generateVue = (component, webpackOpts = {}) => {
  WebpackOptions = webpackOpts
  let code = `
    ${generateScript(component)}
    ${generateStyle(component)}
  `
  return code.trim().replace(/[\r\n]/g, '')
}

/**
 * 生成 script 标签内的代码
 * @param {Object} component
 */
const generateScript = component => {
  let code = '<script>'
  let outerExportNodes = []
  let innerExportNodes = []
  let scriptsCode = []
  collectExtraComponent(component)
  scriptsCode.push(...getScripts(component))
  // 引入 pun 文件中各标签的代码，作代码示例
  scriptsCode.push(getCode(component))
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
  code += getExtraComponentScript()
  code += `export default { ${generateInnerExportCode(innerExportNodes)} }`
  code += '</script>'
  return code
}

const generateStyle = component => {
  let code = ''
  if (util.isComponentObject(component)) {
    if (util.isLabelObject(component.style)) {
      code += `
        ${generateStartTag(component.style, 'style')}
          ${component.style.code}
        </style>
      `
    } else {
      for (let item of Object.values(component.style)) {
        code += `
          ${generateStartTag(item, 'style')}
            ${item.code}
          </style>
        `
      }
    }
  } else {
    for (let [key, item] of Object.entries(component)) {
      if (isNaN(key)) {
        continue
      }
      if (util.isLabelObject(item.style)) {
        code += `
          ${generateStartTag(item.style, 'style')}
            ${item.style.code}
          </style>
        `
        continue
      }
      for (let v of Object.values(item.style)) {
        code += `
          ${generateStartTag(v, 'style')}
            ${v.code}
          </style>
        `
      }
    }
  }
  return code
}

/**
 * 生成开始标签，并将 pun 文件中的标签属性也带过来
 * 如 .pun 文件中 <style lang="scss" scoped>
 * 转化结果也是 <style lang="scss" scoped>
 * @param {Object} label
 * @param {String} name
 */
const generateStartTag = (label, name) => {
  let startTag = `<${name}`
  for (let [k, v] of Object.entries(label.attrs || {})) {
    if (v === '') {
      startTag += ` ${k}`
    } else if (v.constructor === String) {
      startTag += ` ${k}="${v}"`
    } else {
      startTag += ` ${k}=${v}`
    }
  }
  startTag += '>'
  return startTag
}

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

const getScripts = component => {
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
          ${changeCase.camelCase(WebpackOptions.punPrefix + 'Code' + changeCase.pascalCase(WebpackOptions.namespace))}: ${JSON.stringify(result)}
        }
      }
    }
  `
}

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
  if (punComponents.length) {
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

const collectExtraComponent = component => {
  punComponents = []
  if (util.isObjectNull(component)) {
  } else if (util.isComponentObject(component)) {
    if (component.template.code || component.script.code) {
      let componentDeclaration = `${changeCase.pascalCase(WebpackOptions.punPrefix + 'Component' + changeCase.pascalCase(WebpackOptions.namespace))}`
      punComponents.push({
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
      let componentDeclaration = `${changeCase.pascalCase(WebpackOptions.punPrefix + 'Component' + changeCase.pascalCase(key) + changeCase.pascalCase(WebpackOptions.namespace))}`
      punComponents.push({
        name: componentDeclaration,
        template: value.template.code || '',
        script: value.script.code || ''
      })
    }
  }
}

// 附加的组件
const getExtraComponentScript = () => {
  let code = ''
  punComponents.forEach(item => {
    code += `const ${item.name} = ${vueDeclaration}.extend({
      template: \`${item.template}\`,
      ${getOptionScript(item.script)}
    });`
  })
  return code
}

const getOptionScript = code => {
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

const getExtraComponentAst = () => {
  let result = {
    type: 'ObjectExpression',
    properties: []
  }
  punComponents.forEach(item => {
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
