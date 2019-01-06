import Vue from 'vue'
const PunComponent = Vue.extend({
  template: `<p>This is comp2</p>`,
  mounted: function() {
    console.log(2)
  },
  components: {}
})
export default {
  mounted: function() {
    console.log(2)
  },
  data: function() {
    return {
      punCode: {
        template: '<p>This is comp2</p>',
        script: 'export default {\n  mounted () {\n    console.log(2)\n  }\n}',
        style: ''
      }
    }
  },
  components: { PunComponent }
}
