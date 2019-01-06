<template>
  <div>
    <p>This is component test.</p>
    <pun-component />
    <Code lang="vue" :source="punCode.template" />
    <Code lang="js" :source="punCode.script" />
  </div>
</template>

<script>
import Pun from './out-export.pun'
import Code from '../code/'

export default {
  name: 'VueComponent',
  mixins: [Pun],
  components: {
    Code,
    ...Pun.components
  }
}
</script>
