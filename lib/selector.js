const cheerio = require('cheerio')
const util = require('./util')

exports.getComponents = source => {
  const $ = cheerio.load(source)
  // namespace
  let namespace = getLabelInfo($('namespace'), true).code
  let component = getComponentInfo($('component'))
  // 如果存在 component 标签, 则忽略掉 template script style 标签
  if (Object.keys(component).length === 0) {
    component = {
      template: getLabelInfo($('template'), true),
      script: getLabelInfo($('script'), true),
      ...getStyleInfo($('style'))
    }
  }
  if (util.isComponentObject(component)
    && util.isObjectNull(component.template)
    && util.isObjectNull(component.script)
    && util.isObjectNull(component.style)) {
    component = {}
  }
  return { component, namespace }
}

const getComponentInfo = $component => {
  let result = {}
  let length = $component.length
  if (length === 1) {
    let attrs = $component.attr()
    let alias = attrs.alias
    if (alias) {
      result[0] = {
        template: getLabelInfo($component.find('template'), true),
        script: getLabelInfo($component.find('script'), true),
        ...getStyleInfo($component.find('style'))
      }
      result[alias] = result[0]
    } else {
      result = {
        template: getLabelInfo($component.find('template'), true),
        script: getLabelInfo($component.find('script'), true),
        ...getStyleInfo($component.find('style'))
      }
    }
  } else if (length > 1) {
    for (let i = 0; i < length; i++) {
      let $item = $component.eq(i)
      let attrs = $item.attr()
      let alias = attrs.alias
      result[i] = {
        template: getLabelInfo($item.find('template'), true),
        script: getLabelInfo($item.find('script'), true),
        ...getStyleInfo($item.find('style'))
      }
      if (alias) {
        result[alias] = result[i]
      }
    }
  }
  return result
}

const getLabelInfo = ($el, ignorePrev = false) => {
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

const getStyleInfo = $el => {
  let scoped = false
  let style = getLabelInfo($el)
  if (Object.keys(style).length === 0) {
  } else if (util.isLabelObject(style)) {
    Object.keys(style.attrs).some(attr => {
      if (attr === 'scoped') {
        scoped = true
        return true
      }
    })
  } else {
    for (let sty of Object.values(style)) {
      Object.keys(sty.attrs).some(attr => {
        if (attr === 'scoped') {
          scoped = true
          return true
        }
      })
    }
  }
  return { style, scoped }
}
