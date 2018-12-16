<template>
  <div>
    <p>This is component test.</p>
    <pun-component />
  </div>
</template>

<script>
import Pun from './out-export.pun'

export default {
  name: 'VueComponent',
  extends: Pun,
  components: {
    ...Pun.components
  }
}
</script>
