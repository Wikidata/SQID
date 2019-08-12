<template>
  <div :id="claimId">
    <template v-if="!reverse">
      <sqid-collapse-button :id="claimId">
        <snak :snak="mainsnak" :rank="rank" :short="narrow" />
      </sqid-collapse-button>
      <div class="qualifiers" v-for="(prop, pidx) in qualifierOrder" :key="pidx">
        <div v-for="(qualifier, qidx) in qualifiers(prop)" :key="qidx">
          <entity-link :entityId="prop" />: <snak-value :snak="qualifier" />
        </div>
      </div>
      <b-collapse :id="`collapse-${claimId}`">
        <span v-if="!references.length" v-t="'entity.noReferences'" />
        <reference v-for="(reference, refId) in references" :key="refId" :reference="reference" />
      </b-collapse>
    </template>
    <template v-if="reverse">
      <snak :snak="mainsnak" :rank="rank" :short="narrow" reverse />
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { Snak, Claim as ClaimData } from '@/api/types'
import { EntityId } from '@/store/entity/claims/types'
import Reference from '@/components/ClaimReference.vue'
import SnakValue from '@/components/SnakValue.vue'

@Component({
  components: {
    Reference,
    'snak-value': SnakValue,
  }})
export default class Claim extends Vue {
  @Prop({ required: true }) private entityId!: EntityId
  @Prop({ required: true }) private propertyId!: EntityId
  @Prop({ required: true }) private claim!: ClaimData
  @Prop({ default: false, type: Boolean }) private reverse!: boolean
  @Prop({ default: false, type: Boolean }) private narrow!: boolean

  private get mainsnak() {
    return this.claim.mainsnak
  }

  private get type() {
    return this.claim.type
  }

  private get claimId() {
    return this.claim.id
  }

  private get rank() {
    return this.claim.rank
  }

  private get references() {
    return this.claim.references || []
  }

  private get qualifierOrder(): EntityId[] {
    let order: EntityId[] = []

    if (!('qualifiers' in this.claim) ||
        (this.claim.qualifiers === undefined)) {
      return order
    }

    if ('qualifiers-order' in this.claim) {
      order = this.claim['qualifiers-order'] as EntityId[]
    } else if ('qualifiers' in this.claim) {
      order = Object.keys(this.claim.qualifiers)
    }

    return order
  }

  private qualifiers(prop: EntityId): Snak[] {
    if (!('qualifiers' in this.claim) ||
        (this.claim.qualifiers === undefined) ||
        !(prop in this.claim.qualifiers)) {
      return []
    }

    return this.claim.qualifiers[prop]
  }
}
</script>

<style lang="less" scoped>
div.qualifiers {
  font-size: 0.8em;
  padding-left: 10px;
}
</style>
