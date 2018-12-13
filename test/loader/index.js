const fs = require('fs')
const path = require('path')
const prettier = require('prettier')
const glob = require('glob')

const config = require('./config')
const { getComponentContent } = require('../../lib/label-parser')
const { generateVue } = require('../../lib/generate')

glob('./**/*.pun', (err, files) => {
  if (err) {
    throw err
  }
  files.forEach(file => {
    // if (!file.includes('multi-component')) {
    //   return
    // }
    let _source = fs.readFileSync(file, 'utf8')
    let component = getComponentContent(_source)
    let source = generateVue(component)
    let dirname = path.dirname(file)
    fs.writeFileSync(
      path.resolve(`${dirname}/dest.vue`),
      prettier.format(source, config.format),
      'utf8'
    )
  })
})
