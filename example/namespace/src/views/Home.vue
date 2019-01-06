<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import SinglePun from './single.pun'
// import MultiPun from './multi.pun'

export default {
  name: 'home',
  mixins: [SinglePun],
  components: {
    HelloWorld,
    ...SinglePun.components
    // ...MultiPun.components
  }
}
</script>
