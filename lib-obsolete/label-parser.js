const cheerio = require('cheerio')

exports.getTopElementContent = source => {
  let $ = cheerio.load(source)
  let template = getElementInfo($('template'))
  let script = getElementInfo($('script'))
  let style = getElementInfo($('style'))
  return { template, script, style }
}

const getElementInfo = $el => {
  let result = {}
  let length = $el.length
  if (length === 1) {
    let attrs = $el.attr()
    let id = attrs.id
    result = {}
    if (!isNaN(id)) {
      throw Error('The attribute of id must not be a Number!')
    }
    result[0] = {
      code: $el.html().trim(),
      attrs
    }
    if (id) {
      result[id] = result[0]
    }
  } else if (length > 1) {
    result = {}
    for (let i = 0; i < length; i++) {
      let $item = $el.eq(i)
      let attrs = $item.attr()
      let id = attrs.id
      if (!isNaN(id)) {
        throw Error('The attribute of id must not be a Number!')
      }
      result[i] = {
        code: $item.html().trim(),
        attrs
      }
      if (id) {
        result[id] = result[i]
      }
    }
  }
  return result
}
