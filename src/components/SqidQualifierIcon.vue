<template>
  <span v-if="claim.qualifiers.size">
    <font-awesome-icon :id="tooltipId" icon="info-circle" />
    <b-tooltip :target="tooltipId" variant="light">
      <div v-for="(propertyId, pidx) of claim.qualifiers.keys()" :key="pidx">
        <i18n-t
          v-for="(snak, sidx) of claim.qualifiers.get(propertyId)"
          :key="sidx"
          tag="div"
          keypath="entity.qualifierValue"
        >
          <template #qualifier> <entity-link :entity-id="propertyId" /></template>
          <template #value>
            <sqid-snak-value :snak="snak" />
          </template>
        </i18n-t>
      </div>
    </b-tooltip>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EntityId, Snak } from '@/api/types'

const props = defineProps<{
  claim: { qualifiers: Map<EntityId, Array<Snak>>; id: EntityId }
}>()

const tooltipId = computed(() => `qualifier-tooltip-${props.claim.id}`)
</script>

<style scoped>
svg {
  margin-left: 0.25em;
}
</style>
