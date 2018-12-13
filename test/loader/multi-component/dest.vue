<script>
import Vue from 'vue'
const PunComponent0 = Vue.extend({
  template: `<h3>his is pun-loader test 1</h3>`,
  components: {}
})
const PunComponent1 = Vue.extend({
  template: `<section class="test">      <h3>This is pun-loader test</h3>      <p>Funds donated via Patreon go directly to support Evan You&apos;s full-time work on Vue.js.</p>      <button @click="echo">Click</button>    </section>`,
  methods: {
    echo() {
      console.log('Click event trigger')
    }
  },
  components: {}
})
const PunComponentTestOne = Vue.extend({
  template: `<h3>his is pun-loader test 1</h3>`,
  components: {}
})
export default {
  data: function() {
    return {
      PunCode: {
        '0': {
          template: '<h3>his is pun-loader test 1</h3>',
          script: '',
          style: ''
        },
        '1': {
          template:
            '<section class="test">\n      <h3>This is pun-loader test</h3>\n      <p>Funds donated via Patreon go directly to support Evan You&apos;s full-time work on Vue.js.</p>\n      <button @click="echo">Click</button>\n    </section>',
          script:
            "export default {\n      methods: {\n        echo () {\n          console.log('Click event trigger')\n        }\n      }\n    }",
          style:
            '.test {\n        background-color: #000;\n        color: #fff;\n      }'
        },
        testOne: {
          template: '<h3>his is pun-loader test 1</h3>',
          script: '',
          style: ''
        }
      }
    }
  },
  components: { PunComponent0, PunComponent1, PunComponentTestOne }
}
</script>
