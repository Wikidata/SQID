<template>
  <b-nav-form>
    <b-button v-if="!isLoggedIn" @click="initiate" size="sm" class="my-2 my-sm-0">{{ $t('pageTitle.login') }}</b-button>
    <div v-if="isLoggedIn">
      <i18n class="ml-sm-2" tag="span" path="pageTitle.loggedInAs">
        <a :href="'https://wikidata.org/wiki/User:' + username">{{ username }}</a>
      </i18n>
      <b-button @click="logout" id="logoutButton" size="sm" class="my-2 ml-sm-2 my-sm-0">{{ $t('pageTitle.logout') }}</b-button>
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
  @login.Action private initiate: any
  @login.Mutation private logout: any
}
</script>
