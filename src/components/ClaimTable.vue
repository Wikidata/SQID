<template>
  <b-card :header="header">
    <table class="table table-striped table-condensed statements-table">
      <tbody v-if="claims">
        <claim-group :entityId="entityId"
                     :propertyId="prop"
                     :claims="statements(prop)"
                     v-for="prop in claims.keys()"
                     :key="prop" />
      </tbody>
    </table>
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
  @Prop() private header!: string

  private statements(propertyId: EntityId) {
    if (this.claims) {
      return this.claims.get(propertyId)
    }

    return []
  }
}
</script>
