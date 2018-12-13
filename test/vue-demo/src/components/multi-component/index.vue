<template>
  <div>
    <p class="style-test">This is multi component test.</p>
    <pun-component-test-one />
  </div>
</template>

<script>
import Pun from './test.pun'

export default {
  name: 'MultiComponent',
  extends: Pun,
  components: {
    ...Pun.components
  }
}
</script>
