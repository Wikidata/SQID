<template>
  <div :id="claimId">
    <sqid-collapse-button :id="claimId">
      <snak :snak="mainsnak" /> ({{ rank }})
    </sqid-collapse-button>
    <b-collapse :id="`collapse-${claimId}`">
      <span v-if="!references" v-t="'entity.noReferences'" />
      <reference v-for="(reference, refId) in references" :key="refId" :reference="reference" />
    </b-collapse>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { Claim as ClaimData } from '@/api/types'
import { EntityId } from '@/store/entity/claims/types'
import Reference from '@/components/ClaimReference.vue'

@Component({
  components: {
    reference: Reference,
  }})
export default class Claim extends Vue {
  @Prop({ required: true }) private entityId!: EntityId
  @Prop({ required: true }) private propertyId!: EntityId
  @Prop({ required: true }) private claim!: ClaimData

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
    return this.claim.references
  }
}
</script>
