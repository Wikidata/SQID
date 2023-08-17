<template>
  <b-nav-form>
    <b-button v-if="!isLoggedIn" @click="initiate" size="sm" class="my-2 my-sm-0">{{
      t('pageTitle.login')
    }}</b-button>
    <div v-if="isLoggedIn">
      <i18n-t class="ml-sm-2" tag="span" keypath="pageTitle.loggedInAs">
        <a :href="'https://wikidata.org/wiki/User:' + username">{{ username }}</a>
      </i18n-t>
      <b-button @click="logout" id="logoutButton" size="sm" class="my-2 ml-sm-2 my-sm-0">{{
        t('pageTitle.logout')
      }}</b-button>
    </div>
  </b-nav-form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

//const login = useLoginStore()

const username = ref(null)
const isLoggedIn = computed(() => username.value !== null)

function initiate() {
  // todo(mx): implement this
}

function logout() {
  // todo(mx): implement this
}
</script>
