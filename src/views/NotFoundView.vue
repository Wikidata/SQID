<template>
  <sqid-bars>
    <template #mainbar>
      <template v-if="id">
        <h1>
          <i18n-t keypath="errors.noSuchEntity">
            <template #entityId
              ><span>{{ id }}</span></template
            ></i18n-t
          >&nbsp;<small
            >(<a :href="i18nStore.entityUrl(id)">{{ id }}</a
            >)</small
          >
        </h1>
        <div v-t="'errors.noSuchEntityDescription'" />
      </template>
      <template v-else>
        <h1 v-t="'errors.pageNotFound'" />
        <div v-t="'errors.pageNotFoundDescription'" />
      </template>
    </template>
    <template #sidebar>
      <sqid-image file="Colossal octopus by Pierre Denys de Montfort.jpg" :width="260" />
    </template>
  </sqid-bars>
</template>

<script setup lang="ts">
import type { EntityId } from '@/api/types'
import { useI18nStore } from '@/stores/i18n'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{ id: EntityId }>()
const i18nStore = useI18nStore()
</script>
