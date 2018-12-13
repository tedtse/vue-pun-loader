<template>
  <div>
    <p>This is component test.</p>
    <pun-component0 />
    <pun-component-test />
  </div>
</template>

<script>
import Pun from './test.pun'

export default {
  name: 'VueComponent',
  extends: Pun,
  components: {
    ...Pun.components
  }
}
</script>
