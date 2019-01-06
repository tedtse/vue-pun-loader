import Vue from 'vue'
const PunComponent = Vue.extend({
  template: `<section>
      <button @click="echo">click me</button>
    </section>`,
  methods: {
    echo() {
      console.log('click test')
    }
  },
  components: {}
})
export default {
  methods: {
    echo() {
      console.log('click test')
    }
  },
  data: function() {
    return {
      punCode: {
        template:
          '<section>\n      <button @click="echo">click me</button>\n    </section>',
        script:
          "export default {\n      methods: {\n        echo () {\n          console.log('click test')\n        }\n      }\n    }",
        style: ''
      }
    }
  },
  components: { PunComponent }
}
