const cheerio = require('cheerio')

exports.getComponentContent = source => {
  let $ = cheerio.load(source)
  let component = getComponentInfo($('component'))
  // 如果存在 component 标签, 则忽略掉 template script style 标签
  if (Object.keys(component).length === 0) {
    component = {
      template: getElementInfo($('template'), true),
      script: getElementInfo($('script'), true),
      style: getElementInfo($('style'))
    }
  }
  return component
}

const getComponentInfo = $component => {
  let result = {}
  let length = $component.length
  if (length === 1) {
    let attrs = $component.attr()
    let alias = attrs.alias
    if (alias) {
      result[0] = {
        template: getElementInfo($component.find('template'), true),
        script: getElementInfo($component.find('script'), true),
        style: getElementInfo($component.find('style'))
      }
      result[alias] = result[0]
    } else {
      result = {
        template: getElementInfo($component.find('template'), true),
        script: getElementInfo($component.find('script'), true),
        style: getElementInfo($component.find('style'))
      }
    }
  } else if (length > 1) {
    for (let i = 0; i < length; i++) {
      let $item = $component.eq(i)
      let attrs = $item.attr()
      let alias = attrs.alias
      result[i] = {
        template: getElementInfo($item.find('template'), true),
        script: getElementInfo($item.find('script'), true),
        style: getElementInfo($item.find('style'))
      }
      if (alias) {
        result[alias] = result[i]
      }
    }
  }
  return result
}

const getElementInfo = ($el, ignorePrev = false) => {
  let result = {}
  let length = $el.length
  if (length === 1) {
    let attrs = $el.attr()
    result = {
      code: $el.html().trim(),
      attrs
    }
  } else if (length > 1) {
    if (ignorePrev) {
      let $item = $el.eq(length - 1)
      let attrs = $item.attr()
      result = {
        code: $item.html().trim(),
        attrs
      }
    } else {
      for (let i = 0; i < length; i++) {
        let $item = $el.eq(i)
        let attrs = $item.attr()
        result[i] = {
          code: $item.html().trim(),
          attrs
        }
      }
    }
  }
  return result
}
