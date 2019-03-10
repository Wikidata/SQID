<template>
  <b-nav-form>
    <b-button v-if="!isLoggedIn" size="sm" class="my-2 my-sm-0">Login</b-button>
    <div v-if="isLoggedIn">
      <span class="ml-sm-2">Logged in as <a :href="'https://wikidata.org/wiki/User:' + username">{{ username }}</a></span>
      <b-button id="logoutButton" size="sm" class="my-2 ml-sm-2 my-sm-0">Logout</b-button>
    </div>
  </b-nav-form>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { State, Getter, Action, Mutation, namespace } from 'vuex-class'

const login = namespace('login')

@Component
export default class AppNavbarLogin extends Vue {
  @login.Getter private isLoggedIn!: boolean
  @login.Getter private username!: string
}
</script>
