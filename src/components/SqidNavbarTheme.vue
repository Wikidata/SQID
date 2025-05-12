<template>
  <b-nav-item-dropdown right>
    <template #button-content>
      <font-awesome-icon :icon />
    </template>
    <b-dropdown-item @click="theme = 'light'">
      <i18n-t keypath="settings.theme.light">
        <template #icon><font-awesome-icon icon="sun" /></template> </i18n-t
    ></b-dropdown-item>
    <b-dropdown-item @click="theme = 'dark'">
      <i18n-t keypath="settings.theme.dark">
        <template #icon><font-awesome-icon icon="moon" /></template> </i18n-t
    ></b-dropdown-item>
    <b-dropdown-item @click="theme = 'auto'">
      <i18n-t keypath="settings.theme.auto">
        <template #icon><font-awesome-icon icon="circle-half-stroke" /></template> </i18n-t
    ></b-dropdown-item>
  </b-nav-item-dropdown>
</template>

<script setup lang="ts">
import { useColorMode } from 'bootstrap-vue-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

useI18n()
const theme = useColorMode({ emitAuto: true })

const current = computed(() =>
  theme.store.value === 'auto' ? theme.system.value : theme.store.value,
)

const icon = computed(() => {
  if (current.value === 'light') {
    return 'sun'
  } else if (current.value === 'dark') {
    return 'moon'
  } else {
    return 'circle-half-stroke'
  }
})
</script>

<style scoped>
svg {
  margin-right: 0.25em;
}
</style>
