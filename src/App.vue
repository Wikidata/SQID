<template>
  <sqid-navbar />
  <main>
    <router-view />
  </main>
  <sqid-footer />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useI18nStore } from '@/stores/i18n'
import { usePreferredLanguages } from '@vueuse/core'

useI18n()
const i18nStore = useI18nStore()

const preferredLanguages = usePreferredLanguages()

i18nStore.preferLanguages(preferredLanguages.value)
</script>

<style>
:root {
  --red: #990000;
  --green: #339966;
  --blue: #006699;
  --grey: #484848;
}

[data-bs-theme='dark'] {
  --red: var(--bs-danger-text-emphasis);
  --blue: var(--bs-primary-text-emphasis);
  --green: var(--bs-info-text-emphasis);
  --grey: var(--bs-secondary-text-emphasis);
}

#nav {
  font-weight: bold;
  padding-bottom: 1em;

  a {
    color: var(--blue);

    &:hover {
      color: var(--red);
      text-decoration: underline;
    }

    &.active {
      color: var(--green);
    }
  }
}
</style>
