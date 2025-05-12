<template>
  <sqid-bars>
    <template #mainbar>
      <i18n-t tag="h1" keypath="errors.invalidEntity">
        <template #entityId>{{ id }}</template>
      </i18n-t>
      <i18n-t tag="div" keypath="errors.invalidEntityDescription">
        <template #entityId>{{ id }}</template>
        <template #error>{{ error }}</template>
      </i18n-t>
    </template>
    <template #sidebar>
      <sqid-image file="Colossal octopus by Pierre Denys de Montfort.jpg" :width="260" />
    </template>
  </sqid-bars>
</template>

<script setup lang="ts">
import { isError, type EntityId } from '@/api/types'
import { parseEntityId } from '@/api/wikidata'
import { ref, watchEffect } from 'vue'

const props = defineProps<{ id: EntityId }>()
const error = ref<string | null>(null)

watchEffect(() => {
  try {
    parseEntityId(props.id)
  } catch (err) {
    if (isError(err)) {
      error.value = err.message
    }
  }
})
</script>
