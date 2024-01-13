<template>
  <template v-for="(link, lidx) of navlinks" :key="lidx">
    <b-nav-item :to="link.target" active-class="active" :exact="link.exact">{{
      t(link.message)
    }}</b-nav-item>
  </template>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { RouteLocation } from 'vue-router'

const { t } = useI18n()

const props = defineProps<{ navlinks: Array<Navlink> }>()

export interface Navlink {
  target: RouteLocation
  message: string
  exact?: boolean
}
</script>
