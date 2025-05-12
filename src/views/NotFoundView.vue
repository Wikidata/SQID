<template>
  <sqid-bars>
    <template #mainbar>
      <template v-if="id">
        <h1>
          <i18n-t keypath="errors.noSuchEntity">
            <template #entityId
              ><span>{{ id }}</span></template
            >
            <template #entityUrl>
              <i18n-t keypath="errors.noSuchEntityUrl" tag="small"
                ><a :href="i18nStore.entityUrl(id)">{{ id }}</a>
              </i18n-t>
            </template></i18n-t
          >
        </h1>
        <div>{{ t('errors.noSuchEntityDescription') }}</div>
      </template>
      <template v-else>
        <h1>{{ t('errors.pageNotFound') }}</h1>
        <div>{{ t('errors.pageNotFoundDescription') }}</div>
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
import { useI18n } from 'vue-i18n'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{ id: EntityId }>()
const i18nStore = useI18nStore()
const { t } = useI18n()
</script>
