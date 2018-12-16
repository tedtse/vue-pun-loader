<template>
  <div id="app">
    <img src="./assets/logo.png">
    <nav>
      <a v-for="route in routes" :key="route.name" href="javascript:;" @click="go(route.path)">
        {{route.name}}
      </a>
    </nav>
    <router-view/>
  </div>
</template>

<script>
import Router from './router/'
export default {
  name: 'App',
  computed: {
    routes () {
      return Router.options.routes
    }
  },
  methods: {
    go (path) {
      this.$router.push(path)
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
