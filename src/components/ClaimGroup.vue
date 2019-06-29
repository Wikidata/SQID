<template>
<div>
  <span>{{ propertyId }}</span>
  <ul v-for="(claim, cidx) in claims" :key="cidx">
    <claim :entityId="entityId" :propertyId="propertyId" :claim="claim" />
  </ul>
</div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { ClaimsMap, EntityId } from '@/store/entity/claims/types'
import Claim from './Claim.vue'

@Component({
  components: {
    claim: Claim,
  }})
export default class ClaimGroup extends Vue {
  @Prop() private entityId!: EntityId
  @Prop() private propertyId!: EntityId
  @Getter private getClaimsForProperty: any
  private claims: ClaimsMap | null = null

  private mounted() {
    this.updateClaims()
  }

  @Watch('entityId')
  @Watch('propertyId')
  private updateClaims() {
    const claims = this.getClaimsForProperty(this.entityId, this.propertyId)

    if (claims) {
      this.claims = claims
    }
  }
}
</script>
