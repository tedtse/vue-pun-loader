<template>
  <div>
    <p class="style-test">This is multi component test.</p>
    <pun-component-test-one />
    <pun-component1 />
    <Code lang="vue" :source="punCode[0].template" />
    <Code lang="scss" :source="punCode[0].style" />
    <Code lang="vue" :source="punCode[1].template" />
    <Code lang="js" :source="punCode[1].script" />
    <Code lang="scss" :source="punCode[1].style" />
  </div>
</template>

<script>
import Pun from './index.pun'
import Code from '../code/'

export default {
  name: 'MultiComponent',
  mixins: [Pun],
  components: {
    Code,
    ...Pun.components
  }
}
</script>
