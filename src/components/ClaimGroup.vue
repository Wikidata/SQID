<template>
  <tbody>
    <tr :title="propertyId" v-for="(claim, cidx) in claims" :key="cidx">
      <td><entity-link :entityId="propertyId" /></td>
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
  @Prop() private entityId!: EntityId
  @Prop() private propertyId!: EntityId
  @Prop() private claims!: ClaimsMap
}
</script>
