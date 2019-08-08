<template>
  <tbody>
    <tr :title="propertyId" v-for="(claim, cidx) in claims.slice(0, hideAllBut)" :key="cidx">
      <th :rowspan="claims.length" v-if="cidx === 0">
        <entity-link :entityId="propertyId" />
        <template v-if="hiddenClaims">
          <br>
          <sqid-collapse-button :id="collapseId" class="badge">
            {{ $tc('entity.extraStatements', hiddenClaims) }}
          </sqid-collapse-button>
        </template>
      </th>
      <td>
        <claim :entityId="entityId" :propertyId="propertyId" :claim="claim" />
      </td>
    </tr>
    <b-collapse tag="tr"
                :id="`collapse-${collapseId}`"
                v-for="(claim, cidx) in claims.slice(hideAllBut)"
                :key="cidx">
      <td>
        <claim :entityId="entityId" :propertyId="propertyId" :claim="claim" />
      </td>
    </b-collapse>
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
  @Prop({ required: true }) private claims!: Claim[]
  @Prop({ default: false, type: Boolean }) private reverse!: boolean
  @Prop({ default: 3, type: Number }) private hideAllBut!: number

  private get collapseId() {
    const direction = this.reverse ? 'reverse' : 'statements'

    return `${direction}-${this.entityId}-${this.propertyId}`
  }

  private get hiddenClaims() {
    return Math.max(0, this.claims.length - this.hideAllBut)
  }
}
</script>

<style lang="less" scoped>
th {
  vertical-align: top;
  background: #ffffff;

  :not(.narrow) & {
    width: 25%;
  }

  .narrow & {
    width: 40%;
  }
}
</style>
