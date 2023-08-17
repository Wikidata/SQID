<template>
  <span v-if="claim.qualifiers.size">
    <font-awesome-icon icon="info-circle" :id="tooltipId" />
    <b-tooltip :target="tooltipId" variant="light">
      <div v-for="(propertyId, pidx) of claim.qualifiers.keys()" :key="pidx">
        <div v-for="(snak, sidx) of claim.qualifiers.get(propertyId)" :key="sidx">
          <entity-link :entityId="propertyId" />: <snak-value :snak="snak" />
        </div>
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

<style scoped lang="less">
svg {
  margin-left: 0.25em;
}
</style>
