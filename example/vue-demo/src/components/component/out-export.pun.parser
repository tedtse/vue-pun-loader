<script>
import Vue from 'vue'
const msg = 'hello'
const PunComponent = Vue.extend({
  template: `<section>      <button @click="echo">click me</button>    </section>`,
  methods: {
    echo() {
      console.log(msg)
    }
  },
  components: {}
})
export default {
  methods: {
    echo() {
      console.log(msg)
    }
  },
  data: function() {
    return {
      PunCode: {
        template:
          '<section>\n      <button @click="echo">click me</button>\n    </section>',
        script:
          "const msg = 'hello'\n  export default {\n    methods: {\n      echo () {\n        console.log(msg)\n      }\n    }\n  }",
        style: ''
      }
    }
  },
  components: { PunComponent }
}
</script>
