import Vue from 'vue'
const PunComponent = Vue.extend({
  template: `<h3 data-v-7ba5bd90="">This is pun-loader test</h3>`,
  components: {}
})
require('!!vue-style-loader!css-loader?{"sourceMap":false}!../../lib/style/compiler.js?{"labelType":"style","styleIdx":"0","id":"data-v-7ba5bd90","scoped":true}!../../lib/select-loader.js?{"labelType":"style","styleIdx":"0","id":"data-v-7ba5bd90","scoped":true}!/Users/xiepeng/Documents/front-end/pun-loader/test/template/source.pun')
require('!!vue-style-loader!css-loader?{"sourceMap":false}!../../lib/style/compiler.js?{"labelType":"style","styleIdx":"1","id":"data-v-7ba5bd90","scoped":false}!../../lib/select-loader.js?{"labelType":"style","styleIdx":"1","id":"data-v-7ba5bd90","scoped":false}!/Users/xiepeng/Documents/front-end/pun-loader/test/template/source.pun')
export default {
  data: function() {
    return {
      punCode: {
        template: '<h3>This is pun-loader test</h3>',
        script: '',
        style: {
          '0': '.style-test {\n  background-color: #5a1c94;\n  color: #fff;\n}',
          '1': '.style-test p {\n  cursor: pointer;\n}'
        }
      }
    }
  },
  components: { PunComponent }
}
