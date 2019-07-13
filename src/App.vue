<template>
<div id="app">
  <app-navbar/>
  <router-view/>
  <app-footer/>
</div>
</template>

<style lang="less">
#app {
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import EntityLink from '@/components/EntityLink.vue'

Vue.component('entity-link', EntityLink)

@Component({
  components: {
    'app-navbar': AppNavbar,
    'app-footer': AppFooter,
  }})
export default class App extends Vue {
}
</script>

<style src="nprogress/nprogress.css" />
<style src="bootstrap/dist/css/bootstrap.css" />
<style src="bootstrap-vue/dist/bootstrap-vue.css" />
