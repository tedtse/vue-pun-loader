<template>
  <div>
    <p class="style-test">This is style test.</p>
    <pun-component />
  </div>
</template>

<script>
import Pun from './index.pun'

export default {
  name: 'MultiLabel',
  extends: Pun,
  components: {
    ...Pun.components
  }
}
</script>
