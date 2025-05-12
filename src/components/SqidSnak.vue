<template>
  <span>
    <font-awesome-icon v-if="isReverseClaim" icon="arrow-left" />
    <sqid-snak-value :snak="snak" :class="{ deprecated }" :use-short-value />
    <font-awesome-icon v-if="deprecated" :title="t('entity.deprecatedStatement')" icon="ban" />
    <font-awesome-icon v-if="preferred" :title="t('entity.preferredStatement')" icon="star" />
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
    isReverseClaim?: boolean
    useShortValue?: boolean
  }>(),
  {
    isReverseClaim: false,
    useShortValue: false,
  },
)

const deprecated = computed(() => props.rank === 'deprecated')
const preferred = computed(() => props.rank === 'preferred')
</script>

<style scoped>
svg {
  margin-left: 1em;
  margin-right: 1em;
}
</style>
