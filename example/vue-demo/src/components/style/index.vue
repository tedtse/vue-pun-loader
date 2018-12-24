<template>
  <div>
    <p class="style-test">This is style test.</p>
    <Code lang="css" :source="punCode.style"></Code>
  </div>
</template>

<script>
import Code from '../code/'
import Pun from './index.pun'

export default {
  name: 'Style',
  extends: Pun,
  components: {
    Code,
    ...Pun.components
  },
  mounted () {
    console.log(this.$router.options)
  }
}
</script>
