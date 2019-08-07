<template>
  <tbody>
    <tr :title="propertyId" v-for="(claim, cidx) in claims" :key="cidx">
      <th :rowspan="claims.length" v-if="cidx === 0"><entity-link :entityId="propertyId" /></th>
      <td>
        <claim :entityId="entityId" :propertyId="propertyId" :claim="claim" />
      </td>
    </tr>
  </tbody>
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
  @Prop({ required: true }) private entityId!: EntityId
  @Prop({ required: true }) private propertyId!: EntityId
  @Prop({ required: true }) private claims!: ClaimsMap
}
</script>
