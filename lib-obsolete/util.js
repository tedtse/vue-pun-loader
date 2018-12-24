module.exports = {
  parseNodeByImportDeclaration (nodes) {
    let importNodes = []
    let _importNodes = []
    let notImportNodes = []
    nodes.forEach(node => {
      if (node.type === 'ImportDeclaration') {
        _importNodes.push(node)
      } else {
        notImportNodes.push(node)
      }
    })
    _importNodes.forEach(node => {
      let sameValueNode = importNodes.find(n => {
        return n.source.value === node.source.value
      })
      if (!sameValueNode) {
        importNodes.push(node)
        return
      }
      let specifiers = node.specifiers
      if (
        specifiers.length === 1 &&
        specifiers[0].type === 'ImportDefaultSpecifier'
      ) {
        let _importDefaultNode = sameValueNode.specifiers.find(n => {
          return n.type === 'ImportDefaultSpecifier'
        })
        if (_importDefaultNode) {
          return
        }
      }
      if (
        specifiers.length >= 1 &&
        specifiers[0].type !== 'ImportDefaultSpecifier'
      ) {
        specifiers.forEach(n => {
          let sameImportNode = sameValueNode.specifiers.find(_n => {
            return (
              n.type === 'ImportSpecifier' &&
              _n.type === 'ImportSpecifier' &&
              _n.imported.name === n.imported.name
            )
          })
          if (!sameImportNode) {
            sameValueNode.specifiers.push(n)
          }
        })
      }
    })
    return {
      importNodes,
      notImportNodes
    }
  },

  mergeProperties (nodes) {
    let returnJson = {
      type: 'ObjectExpression',
      properties: []
    }
    nodes.forEach(node => {
      let index = returnJson.properties.findIndex(n => {
        return n.key.name === node.key.name
      })
      if (index !== -1) {
        returnJson.properties[index] = node
      } else {
        returnJson.properties.push(node)
      }
    })
    return returnJson
  },

  isObjectNull (object) {
    if (object === null || object === undefined) {
      throw Error('Parameter is invalid! It must be an Object')
    }
    return Object.keys(object).length === 0
  },

  isComponentObject (object) {
    return object.hasOwnProperty('template') && object.hasOwnProperty('script') && object.hasOwnProperty('style')
  },

  isLabelObject (object) {
    return object.hasOwnProperty('attrs') && object.hasOwnProperty('code')
  }
}
