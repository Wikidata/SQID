<template>
  <b-card header-tag="header" no-body>
    <template #header>
      <sqid-collapse-button :id="id">
        <b>{{ header }}</b>
      </sqid-collapse-button>
    </template>
    <b-collapse :id="collapseId" visible>
      <slot />
    </b-collapse>
  </b-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    header: string
    id: string
    useShortValue?: boolean
  }>(),
  { useShortValue: false },
)

const collapseId = computed(() => `collapse-${props.id}`)
</script>

<style scoped>
.card {
  margin: 1.5em 0;
}
</style>
