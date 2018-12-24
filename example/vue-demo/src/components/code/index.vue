<template>
  <pre class="pun-code">
    <code :class="lang" class="hljs" v-html="target"></code>
  </pre>
</template>

<script>
import 'highlight.js/styles/monokai-sublime.css'
import hljs from 'highlight.js/lib/highlight'
import javascript from 'highlight.js/lib/languages/javascript'
import css from 'highlight.js/lib/languages/css'
import scss from 'highlight.js/lib/languages/scss'
import less from 'highlight.js/lib/languages/less'
import xml from 'highlight.js/lib/languages/xml'
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('scss', scss)
hljs.registerLanguage('less', less)
hljs.registerLanguage('xml', xml)

const prettier = require('prettier/standalone')
const plugins = [require('prettier/parser-postcss'), require('prettier/parser-babylon'), require('prettier/parser-html')]

export default {
  name: 'Code',
  props: {
    lang: {
      type: String,
      default: 'js'
    },
    source: {
      type: String | Object
    }
  },
  computed: {
    target () {
      let result
      let formater = prettier.format(this.source, { ...this.getFormat(this.lang), plugins })
      try {
        result = hljs.highlightAuto(formater)
      } catch (e) {
        result = {}
      }
      return result.value || ''
    }
  },
  methods: {
    getFormat (lang) {
      let result = {}
      switch (lang) {
        case 'css':
        case 'scss':
          result = {
            parser: 'scss'
          }
          break
        case 'less':
          result = {
            parser: 'less'
          }
          break
        case 'js':
          result = {
            parser: 'babylon',
            semi: false,
            singleQuote: true
          }
          break
        case 'html':
        case 'vue':
          result = {
            parser: 'html',
            proseWrap: 'preserve',
            htmlWhitespaceSensitivity: 'ignore'
          }
          break
      }
      return result
    }
  }
}
</script>

<style>
  .pun-code {
    text-align: left;
    margin: 15px 0;
    padding: 0;
    font-family: Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace;
    font-size: 14px;
  }
  .pun-code code {
    border-radius: 5px;
    margin: 0;
    padding: 20px 24px;
  }
</style>
