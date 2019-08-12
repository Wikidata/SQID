<template>
  <sqid-collapsible-card :header="header"
                         :id="id"
                         :narrow="narrow">
    <b-card-body class="overflow" v-if="!reverseClaims || !reverseClaims.size">
      <table :class="['table', 'table-striped', { narrow, 'table-sm': narrow }]">
        <template v-if="claims">
          <claim-group :entityId="entityId"
                       :narrow="narrow"
                       :propertyId="prop"
                       :claims="statements(prop)"
                       v-for="prop in claims.keys()"
                       :key="prop" />
        </template>
      </table>
    </b-card-body>
    <b-tabs card v-if="reverseClaims && reverseClaims.size">
      <b-tab class="overflow"
             :title="$t('entity.ownStatements')"
             :disabled="!claims.size">
        <table :class="['table', 'table-striped', { narrow, 'table-sm': narrow }]">
          <template v-if="claims">
            <claim-group :entityId="entityId"
                         :propertyId="prop"
                         :narrow="narrow"
                         :claims="statements(prop)"
                         v-for="prop in claims.keys()"
                         :key="prop" />
          </template>
        </table>
      </b-tab>
      <b-tab class="overflow" :title="$t('entity.reverseStatements')">
        <table :class="['table', 'table-striped', { narrow, 'table-sm': narrow }]">
          <template v-if="reverseClaims">
            <claim-group :entityId="entityId"
                         :propertyId="prop"
                         :narrow="narrow"
                         :claims="reverseStatements(prop)"
                         v-for="prop in reverseClaims.keys()"
                         :key="prop"
                         reverse />
          </template>
        </table>
      </b-tab>
    </b-tabs>
  </sqid-collapsible-card>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { ClaimsMap, EntityId } from '@/store/entity/claims/types'
import ClaimGroup from './ClaimGroup.vue'

@Component({
  components: {
    'claim-group': ClaimGroup,
  }})
export default class ClaimTable extends Vue {
  @Prop({ required: true }) private entityId!: EntityId
  @Prop({ required: true }) private claims!: ClaimsMap
  @Prop({ default: undefined }) private reverseClaims: ClaimsMap | undefined
  @Prop({ required: true }) private header!: string
  @Prop({ required: true }) private id!: string
  @Prop({ default: false, type: Boolean }) private narrow!: boolean

  private get collapseId() {
    return `collapse-${this.id}`
  }

  private statements(propertyId: EntityId) {
    if (this.claims) {
      return this.claims.get(propertyId)
    }

    return []
  }

  private reverseStatements(propertyId: EntityId) {
    if (this.reverseClaims) {
      return this.reverseClaims.get(propertyId)
    }

    return []
  }
}
</script>

<style lang="less" scoped>
.card-body {
  padding: 0 0;
}

.overflow {
  overflow: auto;
}

table {
  margin-bottom: 0px;
  table-layout: fixed;
}

.narrow {
  font-size: 90%;
}
</style>
