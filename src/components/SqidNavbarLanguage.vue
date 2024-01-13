<template>
  <b-nav-item-dropdown :text="current" right>
    <b-dropdown-item
      v-for="(lang, key) in i18nStore.languages"
      :key="key"
      @click="i18nStore.setLanguage(key as string)"
      href="#"
      >{{ t('pageTitle.language', lang) }}</b-dropdown-item
    >
  </b-nav-item-dropdown>
</template>

<script setup lang="ts">
import { useI18nStore } from '@/stores/i18n'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const i18nStore = useI18nStore()
const current = computed(() => {
  const lang = i18nStore.languages[i18nStore.language]
  return t('pageTitle.language', lang)
})
</script>
