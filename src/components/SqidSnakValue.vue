<template>
  <span>
    <template v-if="snaktype === 'value'">
      <sqid-data-value :value="snak.datavalue" :property-id="snak.property" :use-short-value />
    </template>
    <template v-else-if="snaktype === 'somevalue'">{{ t('entity.someValue') }}</template>
    <template v-else-if="snaktype === 'novalue'">{{ t('entity.noValue') }}</template>
    <template v-else>{{ t('errors.unknownSnakType') }}</template>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Snak } from '@/api/types'

const { t } = useI18n()

interface Props {
  snak: Snak
  useShortValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  useShortValue: false,
})

const snaktype = computed(() => {
  return props.snak.snaktype
})
</script>

<style scoped>
span.deprecated {
  text-decoration: line-through;
}
</style>
