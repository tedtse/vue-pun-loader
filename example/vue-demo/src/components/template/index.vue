<template>
  <div class="style-test">
    <p>This is template test.</p>
    <pun-component />
    <Code lang="vue" :source="punCode.template" />
    <Code lang="js" :source="punCode.script" />
    <Code lang="scss" :source="punCode.style" />
  </div>
</template>

<script>
import Pun from './index.pun'
import Code from '../code/'

export default {
  name: 'Template',
  extends: Pun,
  components: {
    Code,
    ...Pun.components
  }
}
</script>
