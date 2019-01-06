const fs = require('fs')
const path = require('path')
const prettier = require('prettier')
const glob = require('glob')

const config = require('./config')
const { getComponents } = require('../lib/selector')
const { generateScript } = require('../lib/generate')

glob('test/**/*.pun', (err, files) => {
  if (err) {
    throw err
  }
  files.forEach(file => {
    if (!file.includes('namespace')) {
      return
    }
    let _source = fs.readFileSync(file, 'utf8')
    let { component, namespace } = getComponents(_source)
    let source = generateScript(component, {
      punPrefix: 'Pun',
      debug: false,
      moduleId: 'data-v-7ba5bd90',
      namespace
    }, path.resolve(__dirname, '../', file))
    let dirname = path.dirname(file)
    fs.writeFileSync(
      path.resolve(`${dirname}/dest.js`),
      prettier.format(source, config.format),
      'utf8'
    )
  })
})
