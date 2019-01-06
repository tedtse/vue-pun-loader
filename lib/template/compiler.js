const cheerio = require('cheerio')

module.exports = function (template, scoped, moduleId) {
  const $ = cheerio.load(template)
  if (!scoped) {
    return template
  }

  $('body *').map((index, el) => {
    $(el).attr(moduleId, '')
  })
  return $('body').html()
}
