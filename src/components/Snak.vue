<template>
  <span>
    <font-awesome-icon icon="arrow-left" v-if="reverse" />
    <snak-value :snak="snak" :class="{ deprecated }" :short="short" />
    <font-awesome-icon :title="t('entity.deprecatedStatement')" icon="ban" v-if="deprecated" />
    <font-awesome-icon :title="t('entity.preferredStatement')" icon="star" v-if="preferred" />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Rank, Snak } from '@/api/types'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    snak: Snak
    rank: Rank
    reverse: boolean
    short: boolean
  }>(),
  {
    reverse: false,
    short: false,
  },
)

const deprecated = computed(() => props.rank === 'deprecated')
const preferred = computed(() => props.rank === 'preferred')
</script>

<style scoped lang="less">
svg {
  margin-left: 1em;
  margin-right: 1em;
}
</style>
