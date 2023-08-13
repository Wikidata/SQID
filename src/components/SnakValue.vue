<template>
  <span>
    <template v-if="snaktype === 'value'">
      <data-value :value="snak.datavalue" :propertyId="snak.property" :short="short" />
    </template>
    <template v-else-if="snaktype === 'somevalue'">{{ t('entity.someValue') }}</template>
    <template v-else-if="snaktype === 'novalue'">{{ t('entity.noValue') }}</template>
    <template v-else>unknown snaktype</template>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Snak } from '@/api/types'

const { t } = useI18n()

interface Props {
  snak: Snak
  short?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  short: false,
})

const snaktype = computed(() => {
  return props.snak.snaktype
})
</script>

<style lang="less" scoped>
span.deprecated {
  text-decoration: line-through;
}
</style>
