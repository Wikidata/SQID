<template>
  <tbody>
    <tr :title="tooltip"
        v-for="(claim, cidx) in claims.slice(0, hideAllBut)"
        :key="cidx">
      <th :rowspan="shownRows" v-if="cidx === 0">
        <entity-link :entityId="propertyId" />
        <template v-if="hiddenClaims">
          <br>
          <sqid-collapse-button :id="collapseId" class="badge">
            {{ $tc('entity.extraStatements', hideAllBut + hiddenClaims) }}
          </sqid-collapse-button>
        </template>
      </th>
      <td>
        <claim :entityId="entityId"
               :propertyId="propertyId"
               :claim="claim"
               :reverse="reverse"
               :narrow="narrow" />
      </td>
    </tr>
    <b-collapse tag="tr"
                :title="tooltip"
                :id="`collapse-${collapseId}`"
                v-for="(claim, cidx) in claims.slice(hideAllBut)"
                :key="cidx + hideAllBut"
                @show="onToggle(true)"
                @hidden="onToggle(false)">
      <td>
        <claim :entityId="entityId"
               :propertyId="propertyId"
               :claim="claim"
               :reverse="reverse"
               :narrow="narrow" />
      </td>
    </b-collapse>
  </tbody>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { ClaimsMap, EntityId } from '@/store/entity/claims/types'
import { i18n } from '@/i18n'
import Claim from './Claim.vue'

@Component({
  components: {
    claim: Claim,
  }})
export default class ClaimGroup extends Vue {
  @Prop({ required: true }) private entityId!: EntityId
  @Prop({ required: true }) private propertyId!: EntityId
  @Prop({ required: true }) private claims!: Claim[]
  @Prop({ default: false, type: Boolean }) private narrow!: boolean
  @Prop({ default: false, type: Boolean }) private reverse!: boolean
  @Prop({ default: 4, type: Number }) private hideAllBut!: number
  @Action private getLabel: any
  private shownRows = Math.min(this.claims.length, this.hideAllBut)
  private label: string = this.propertyId

  private get collapseId() {
    const direction = this.reverse ? 'reverse' : 'statements'

    return `${direction}-${this.entityId}-${this.propertyId}`
  }

  private get hiddenClaims() {
    return Math.max(0, this.claims.length - this.hideAllBut)
  }

  private get language() {
    return i18n.locale
  }

  private get tooltip() {
    return `${this.label} (${this.propertyId})`
  }

  private async updateLabel() {
    this.label = await this.getLabel({
      entityId: this.propertyId,
      lang: this.language,
    })
  }

  private created() {
    this.updateLabel()
  }

  @Watch('propertyId')
  @Watch('language')
  private onPropertyIdChanged() {
    this.updateLabel()
  }

  private onToggle(shown: boolean) {
    const claims = this.claims.length

    if (shown) {
      this.shownRows = claims
    } else {
      this.shownRows = Math.min(this.hideAllBut, claims)
    }
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
