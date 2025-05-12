<template>
  <router-link :to="destination" :title="tooltip" @click="$event.stopImmediatePropagation()">
    {{ label }}
  </router-link>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import type { EntityId } from '@/api/types'
import { useEntitiesTermsStore } from '@/stores/entities-terms'

useI18n()
const entitiesTerms = useEntitiesTermsStore()

const props = defineProps<{ entityId: EntityId }>()

const label = ref<EntityId>('')

watchEffect(async () => {
  label.value = props.entityId
  label.value = await entitiesTerms.getLabel({ entityId: props.entityId })
})

const destination = computed(() => {
  return {
    name: 'entity',
    params: { id: props.entityId },
  }
})

const tooltip = computed(() => {
  return `${label.value} (${props.entityId})`
})
</script>
