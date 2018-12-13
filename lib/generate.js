const acorn = require('acorn')
const estraverse = require('estraverse')
const escodegen = require('escodegen')
const changeCase = require('change-case')

const { optionalHandler } = require('./vue-optional')
const util = require('./util')

let punComponents = []
let vueDeclaration
let webpackOptions

/**
 * 根据 pun 文件生成新的 vue 文件
 */
exports.generateVue = (component, webpackOpts = {}) => {
  webpackOptions = webpackOpts
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
  // 引入 pun 文件中各标签的代码，作代码示例
  scriptsCode.push(getCodeScript(component))
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
          innerExportNodes = [...innerExportNodes, ...node.declaration.properties]
        } else {
          outerExportNodes.push(node)
        }
      }
    })
  })
  code += generateOuterExportscriptsCode(outerExportNodes, component)
  code += `export default { ${generateInnerExportscriptsCode(innerExportNodes)} }`
  code += '</script>'
  return code
}

const generateStyle = component => {
  let code = ''
  if (isComponentObject(component)) {
    if (component.style.code) {
      code += `
        ${generateStartTag(component.style, 'style')}
          ${component.style.code}
        </style>
      `
    }
  } else {
    for (let [key, item] of Object.entries(component)) {
      if (!isNaN(key) || !item.style.code) {
        continue
      }
      code += `
        ${generateStartTag(item.style, 'style')}
          ${item.style.code}
        </style>
      `
    }
  }
  return code
}

/**
 * 生成开始标签，并将 pun 文件中的标签属性也带过来
 * 如 pun 文件中 <style lang="scss" scoped>
 * 生成的
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

const generateOuterExportscriptsCode = (outerExportNodes, component) => {
  let code = ''
  let { importNodes, notImportNodes } = util.parseNodeByImportDeclaration(outerExportNodes)
  importNodes.forEach(node => {
    code += escodegen.generate(node)
  })
  code += getVueImportScript(importNodes)
  notImportNodes.forEach(node => {
    code += escodegen.generate(node)
  })
  code += getExtraComponentScript(component)
  return code
}

const generateInnerExportscriptsCode = (innerExportNodes, ignoreExtraComponent = false) => {
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

const getCodeScript = component => {
  let result = {}
  if (Object.keys(component).length === 0) {
  } else if (isComponentObject(component)) {
    result = {
      template: component.template.code || '',
      script: component.script.code || '',
      style: component.style.code || ''
    }
  } else {
    for (let [k, v] of Object.entries(component)) {
      result[k] = {
        template: v.template.code || '',
        script: v.script.code || '',
        style: v.style.code || ''
      }
    }
  }
  return `
    export default {
      data () {
        return {
          ${webpackOptions.punPrefix}Code: ${JSON.stringify(result)}
        }
      }
    }
  `
}

const getVueImportScript = importNodes => {
  let code = ''
  let mustImportVue = importNodes.every(node => {
    if (node.source.value === 'vue') {
      node.specifiers.every(spec => {
        if (spec.type === 'ImportDefaultSpecifier') {
          vueDeclaration = spec.local.name
          return false
        }
      })
      return false
    }
  })
  if (!vueDeclaration) {
    vueDeclaration = 'Vue'
  }
  if (mustImportVue) {
    code = `import ${vueDeclaration} from 'vue';`
  }
  return code
}

// 附加的组件
const getExtraComponentScript = component => {
  let code = ''
  punComponents = []
  if (Object.keys(component).length === 0) {
  } else if (isComponentObject(component)) {
    let componentDeclaration = `${webpackOptions.punPrefix}Component`
    code += `const ${componentDeclaration} = ${vueDeclaration}.extend({
      template: \`${component.template.code || ''}\`,
      ${getOptionScript(component.script.code || '')}
    });`
    punComponents.push(componentDeclaration)
  } else {
    for (let [key, value] of Object.entries(component)) {
      let componentDeclaration = `${webpackOptions.punPrefix}Component${changeCase.pascalCase(key)}`
      code += `const ${componentDeclaration} = ${vueDeclaration}.extend({
        template: \`${value.template.code || ''}\`,
        ${getOptionScript(value.script.code || '')}
      });`
      punComponents.push(componentDeclaration)
    }
  }
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
        innerExportNodes = [...node.declaration.properties]
      }
    }
  })
  return generateInnerExportscriptsCode(innerExportNodes, true)
}

const getExtraComponentAst = () => {
  let result = {
    type: 'ObjectExpression',
    properties: []
  }
  punComponents.forEach(component => {
    result.properties.push({
      type: 'Property',
      computed: false,
      kind: 'init',
      method: false,
      shorthand: true,
      key: {
        type: 'Identifier',
        name: component
      },
      value: {
        type: 'Identifier',
        name: component
      }
    })
  })
  return result
}

const isComponentObject = object => {
  return object.hasOwnProperty('template') && object.hasOwnProperty('script') && object.hasOwnProperty('style')
}
