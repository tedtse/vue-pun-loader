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
        style: {
          '0': '.style-test {\n  background-color: #5a1c94;\n  color: #fff;\n}',
          '1': '.style-test p {\n  cursor: pointer;\n}'
        }
      }
    }
  },
  components: { PunComponent }
}
</script>              <style scoped>
.style-test {
  background-color: #5a1c94;
  color: #fff;
}
</style>                  <style scoped>
.style-test p {
  cursor: pointer;
}
</style>
