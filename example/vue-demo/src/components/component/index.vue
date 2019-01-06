<template>
  <div>
    <p>This is component test.</p>
    <pun-component0 />
    <pun-component-test />
    <Code lang="vue" :source="punCode[0].template" />
    <Code lang="js" :source="punCode[0].script" />
  </div>
</template>

<script>
import Pun from './index.pun'
import Code from '../code/'

export default {
  name: 'VueComponent',
  mixins: [Pun],
  components: {
    ...Pun.components,
    Code
  }
}
</script>
