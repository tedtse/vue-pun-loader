const estraverse = require('estraverse')
const escodegen = require('escodegen')

const util = require('./util')

const VUE_OPTIONAL_TYPES = {
  merge: ['props', 'propsData', 'computed', 'methods', 'watch', 'directives', 'filters', 'components', 'extends'],
  overwrite: ['name', 'model'],
  decorate: ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'activated', 'deactivated', 'beforeDestroy', 'destroyed', 'errorCaptured'],
  returnMerge: ['data'],
  arrayUinique: ['mixins']
}

exports.optionalHandler = (key, values) => {
  let code = ''
  let type
  for (let [k, v] of Object.entries(VUE_OPTIONAL_TYPES)) {
    if (v.indexOf(key) !== -1) {
      type = k
    }
  }
  if (!type) {
    throw Error('Unkown type of Vue optional')
  }
  switch (type) {
    case 'merge':
      code += mergeHandler(key, values)
      break
    case 'overwrite':
      code += overwritHandler(key, values)
      break
    case 'decorate':
      code += decorateHandler(key, values)
      break
    case 'returnMerge':
      code += returnMergeHandler(key, values)
      break
    case 'arrayUinique':
      code += arrayUiniqueHandler(key, values)
      break
  }
  return code
}

const mergeHandler = (key, values) => {
  let jsonNodes = []
  values.forEach(ast => {
    jsonNodes = [...jsonNodes, ...ast.properties]
  })
  let jsonData = util.mergeProperties(jsonNodes)
  let code = `${key}: ${escodegen.generate(jsonData)},`
  return code
}

const overwritHandler = (key, values) => {
  let finalNode
  values.forEach(ast => {
    finalNode = ast
  })
  let code = `${key}: ${escodegen.generate(finalNode)},`
  return code
}

const decorateHandler = (key, values) => {
  let code = ''
  let functionNode = {
    type: 'FunctionExpression',
    body: {
      type: 'BlockStatement',
      body: []
    }
  }
  values.forEach(ast => {
    if (functionNode.expression === undefined) {
      functionNode.expression = ast.expression
    }
    if (functionNode.generator === undefined) {
      functionNode.generator = ast.generator
    }
    if (functionNode.params === undefined) {
      functionNode.params = ast.params
    }
    functionNode.body.body = [...functionNode.body.body, ...ast.body.body]
  })
  code = `${key}: ${escodegen.generate(functionNode)},`
  return code
}

const returnMergeHandler = (key, values) => {
  let code = ''
  let notReturnNodes = []
  let returnNodes = []
  values.forEach(ast => {
    estraverse.traverse(ast, {
      enter (node, parent) {
        if (!parent || (parent.type !== 'FunctionExpression' && node.body !== 'BlockStatement')) {
          return
        }
        node.body.forEach(n => {
          if (n.type === 'ReturnStatement') {
            returnNodes = [...returnNodes, ...n.argument.properties]
          } else {
            notReturnNodes.push(n)
          }
        })
      }
    })
  })
  let { importNodes, notImportNodes } = util.parseNodeByImportDeclaration(notReturnNodes)
  importNodes.forEach(node => {
    code += escodegen.generate(node)
  })
  notImportNodes.forEach(node => {
    code += escodegen.generate(node)
  })
  let returnJson = util.mergeProperties(returnNodes)
  code += `return ${escodegen.generate(returnJson)}`
  code = `${key}: function () { ${code} },`
  return code
}

const arrayUiniqueHandler = (key, values) => {
  let code = ''
  let eleNodes = []
  values.forEach(ast => {
    if (ast.type !== 'ArrayExpression') {
      return
    }
    let els = ast.elements
    els.forEach(el => {
      let sameNode = eleNodes.some(e => {
        return e.type === el.type && e.name === el.name
      })
      if (!sameNode) {
        eleNodes.push(el)
      }
    })
  })
  let arrayNode = {
    type: 'ArrayExpression',
    elements: eleNodes
  }
  code = `${key}: ${escodegen.generate(arrayNode)},`
  return code
}
