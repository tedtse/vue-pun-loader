const acorn = require('acorn')
const estraverse = require('estraverse')
const escodegen = require('escodegen')
const changeCase = require('change-case')

const { optionalHandler } = require('./vue-optional')
const util = require('./util')

let vueDeclaration
let punComponentPrefix = 'PunComponent'
let punComponents = []

/**
 * 根据 pun 文件生成新的 vue 文件
 */
exports.generateVue = (template, script, style) => {
  let result = `
    ${generateStartTag(script, 'script')}
      ${generateScript(template, script, style)}
    </script>
  `
  if (Object.keys(style).length > 0) {
    for (let item of Object.values(style)) {
      result += `
        ${generateStartTag(item, 'style')}
          ${item.code}
        </style>
      `
    }
  }
  return result.trim().replace(/[\r\n]/g, '')
}

/**
 * 生成 script 标签内的代码
 * @param {Object} template
 * @param {Object} script
 * @param {Object} style
 */
const generateScript = (template, script, style) => {
  let code = ''
  let outerExportNodes = []
  let innerExportNodes = []
  let scriptsCode = []
  for (let [k, v] of Object.entries(script)) {
    if (!isNaN(k)) {
      scriptsCode.push(v.code)
    }
  }
  // 引入 pun 文件中各标签的代码，作代码示例
  scriptsCode.push(getCodeScript(template, script, style))
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
  code += generateOuterExportscriptsCode(outerExportNodes, template)
  code += generateInnerExportscriptsCode(innerExportNodes)
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

const generateOuterExportscriptsCode = (outerExportNodes, template) => {
  let code = ''
  let { importNodes, notImportNodes } = util.parseNodeByImportDeclaration(outerExportNodes)
  importNodes.forEach(node => {
    code += escodegen.generate(node)
  })
  code += getVueImportScript(importNodes, template)
  notImportNodes.forEach(node => {
    code += escodegen.generate(node)
  })
  code += getExtraComponentScript(template)
  return code
}

const generateInnerExportscriptsCode = innerExportNodes => {
  let code = ''
  let optionalCollection = {}
  // let optionalScript = {}
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
  let extraComponentAst = getExtraComponentAst()
  if (!optionalCollection.components) {
    optionalCollection.components = []
  }
  optionalCollection.components.push(extraComponentAst)
  for (let [key, values] of Object.entries(optionalCollection)) {
    code += optionalHandler(key, values)
  }
  return `export default { ${code} }`
}

const getCodeScript = (template, script, style) => {
  const code2String = label => {
    let result
    if (Object.keys(label).length === 0) {
      result = null
    } else {
      result = {}
      for (let [k, v] of Object.entries(label))
      result[k] = v.code
    }
    return JSON.stringify(result)
  }
  return `
    export default {
      data () {
        return {
          punTemplateCode: ${code2String(template)},
          punScriptCode: ${code2String(script)},
          punStyleCode: ${code2String(style)}
        }
      }
    }
  `
}

const getVueImportScript = (importNodes, template) => {
  let code = ''
  // if (template.code && template.code.constructor === String) {
  //   vueDeclaration = 'Vue'
  //   code = `import ${vueDeclaration} from 'vue';`
  //   return code
  // }
  let mustImportVue = true
  if (Object.keys(template).length === 0) {
    mustImportVue = false
  } else {
    mustImportVue = importNodes.every(node => {
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
  }
  if (!vueDeclaration) {
    vueDeclaration = 'Vue'
  }
  if (mustImportVue) {
    code = `import ${vueDeclaration} from 'vue';`
  }
  return code
}

// 附加的组件
const getExtraComponentScript = template => {
  let code = ''
  punComponents = []
  // if (template.code && template.code.constructor === String) {
  //   let componentDeclaration = punComponentPrefix
  //   // generateComponent(component)
  //   code += `const ${punComponentPrefix} = ${vueDeclaration}.extend({
  //     template: \`${template.code}\`
  //   });`
  //   punComponents.push(componentDeclaration)
  // } else if (template.constructor === Object) {
  //   for (let [key, value] of Object.entries(template)) {
  //     let componentDeclaration = `${punComponentPrefix}${changeCase.pascalCase(key)}`
  //     code += `const ${componentDeclaration} = ${vueDeclaration}.extend({
  //       template: \`${value.code}\`
  //     });`
  //     punComponents.push(componentDeclaration)
  //   }
  // }
  for (let [key, value] of Object.entries(template)) {
    let componentDeclaration = `${punComponentPrefix}${changeCase.pascalCase(key)}`
    code += `const ${componentDeclaration} = ${vueDeclaration}.extend({
      template: \`${value.code}\`
    });`
    punComponents.push(componentDeclaration)
  }
  return code
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
