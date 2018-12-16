<template>
  <div>
    <p class="style-test">This is multi component test.</p>
    <pun-component-test-one />
    <pun-component1 />
  </div>
</template>

<script>
import Pun from './index.pun'

export default {
  name: 'MultiComponent',
  extends: Pun,
  components: {
    ...Pun.components
  }
}
</script>
