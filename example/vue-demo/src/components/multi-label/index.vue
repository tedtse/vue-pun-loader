<template>
  <div>
    <p class="style-test">This is style test.</p>
    <pun-component />
    <Code lang="vue" :source="punCode.template" />
    <Code lang="js" :source="punCode.script" />
  </div>
</template>

<script>
import Pun from './test.pun'
import Code from '../code/'

export default {
  name: 'MultiLabel',
  mixins: [Pun],
  components: {
    Code,
    ...Pun.components
  }
}
</script>
