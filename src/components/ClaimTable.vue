<template>
  <b-card header-tag="header" no-body>
    <template v-slot:header>
      <sqid-collapse-button :id="id">
        {{ header }}
      </sqid-collapse-button>
    </template>
    <b-collapse :id="collapseId" visible>
      <b-card-body class="overflow" v-if="!reverseClaims || !reverseClaims.size">
        <table class="table table-striped table-condensed statements-table">
          <template v-if="claims">
            <claim-group :entityId="entityId"
                         :propertyId="prop"
                         :claims="statements(prop)"
                         v-for="prop in claims.keys()"
                         :key="prop" />
          </template>
        </table>
      </b-card-body>
      <b-tabs card v-if="reverseClaims && reverseClaims.size">
        <b-tab class="overflow" :title="$t('entity.ownStatements')">
          <table class="table table-striped table-condensed statements-table">
            <template v-if="claims">
              <claim-group :entityId="entityId"
                           :propertyId="prop"
                           :claims="statements(prop)"
                           v-for="prop in claims.keys()"
                           :key="prop" />
            </template>
          </table>
        </b-tab>
        <b-tab class="overflow" :title="$t('entity.reverseStatements')">
          <table class="table table-striped table-condensed statements-table">
            <template v-if="reverseClaims">
              <claim-group :entityId="entityId"
                           :propertyId="prop"
                           :claims="reverseStatements(prop)"
                           v-for="prop in reverseClaims.keys()"
                           :key="prop"
                           reverse />
            </template>
          </table>
        </b-tab>
      </b-tabs>
    </b-collapse>
  </b-card>
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
.card {
  margin: 1.5em 0;
}

.overflow {
  overflow: auto;
}
</style>
