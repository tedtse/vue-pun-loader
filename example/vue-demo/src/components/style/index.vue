<template>
  <p class="style-test">This is style test.</p>
</template>

<script>
import Pun from './index.pun'

export default {
  name: 'Style',
  extends: Pun,
  components: {
    ...Pun.components
  }
}
</script>
