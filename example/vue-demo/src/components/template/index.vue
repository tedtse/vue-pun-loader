<template>
  <div class="style-test">
    <p>This is template test.</p>
    <pun-component />
  </div>
</template>

<script>
import Pun from './index.pun'

export default {
  name: 'Template',
  extends: Pun,
  components: {
    ...Pun.components
  }
}
</script>
