<script>
import Vue from 'vue'
const PunComponent = Vue.extend({
  template: `<h3>This is pun-loader test</h3>`,
  components: {}
})
export default {
  data: function() {
    return {
      PunCode: {
        template: '<h3>This is pun-loader test</h3>',
        script: '',
        style: ''
      }
    }
  },
  components: { PunComponent }
}
</script>
