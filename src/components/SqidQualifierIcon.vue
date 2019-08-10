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

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { EntityId, Snak } from '@/api/types'
import SnakValue from './SnakValue.vue'

@Component({
  components: {
    'snak-value': SnakValue,
  },
})
export default class SqidQualifierIcon extends Vue {
  @Prop({ required: true }) private claim!: {
    qualifiers: Map<EntityId, Snak[]>,
    id: string,
  }

  private get tooltipId() {
    return `qualifier-tooltip-${this.claim.id}`
  }
}
</script>

<style lang="less" scoped>
svg {
  margin-left: .25em;
}
</style>
