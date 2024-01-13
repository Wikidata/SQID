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

const i18n = useI18n()
const i18nStore = useI18nStore()
</script>

<style lang="less">
:root {
  --red: #990000;
  --green: #339966;
  --blue: #006699;
  --grey: #484848;
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
