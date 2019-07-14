<template>
<div :id="claimId">
  <snak :snak="mainsnak" /> ({{ rank }})
  <reference v-for="(reference, refId) in references" :key="refId" :reference="reference" />
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
  @Prop() private entityId!: EntityId
  @Prop() private propertyId!: EntityId
  @Prop() private claim!: ClaimData

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
