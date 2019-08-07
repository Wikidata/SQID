<template>
  <b-card :header="header" no-body>
    <b-card-body v-if="!reverseClaims">
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
    <b-tabs card v-if="reverseClaims">
      <b-tab :title="$t('entity.ownStatements')">
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
      <b-tab :title="$t('entity.reverseStatements')">
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
  @Prop() private entityId!: EntityId
  @Prop() private claims!: ClaimsMap
  @Prop() private reverseClaims: ClaimsMap | undefined
  @Prop() private header!: string

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
