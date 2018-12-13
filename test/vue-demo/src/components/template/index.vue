<template>
  <div>
    <p>This is template test.</p>
    <pun-component />
  </div>
</template>

<script>
import Pun from './test.pun'

export default {
  name: 'Template',
  extends: Pun,
  components: {
    ...Pun.components
  }
}
</script>
