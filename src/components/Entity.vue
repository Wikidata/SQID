<template>
  <div class="container">
    <div class="mainbar col-lg-9 col-md-12 col-sm-12">
      <h1><span>{{ label }}</span>
        &nbsp;<small>(<a :href="wikidataUrl">{{ entityId }}</a>)</small></h1>
      <div id="aliases">
        <ul class="list-inline">
          <li class="list-inline-item" v-for="alias in aliases" :key="alias.value">{{ alias }}</li>
        </ul>
      </div>
      <div id="description">{{ description }}</div>
      <div id="claims" v-if="claims">
        <table class="table table-striped table-condensed statements-table">
          <tbody>
            <claim-group :entityId="entityId" :propertyId="prop" :claims="statements(prop)" v-for="prop in claims.keys()" :key="prop" />
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { Getter, Action, Mutation, namespace } from 'vuex-class'
import { ClaimsMap, EntityId } from '@/store/entity/claims/types'
import ClaimGroup from './ClaimGroup.vue'
import { relatedEntityIds } from '@/api/wikidata'

@Component({
  components: {
   'claim-group': ClaimGroup,
  }})
export default class Entity extends Vue {
  @Prop() private entityId!: string
  @Action private getEntityData: any
  @Action private requestLabels: any
  private label = this.entityId
  private aliases: string[] = []
  private description: string | null = null
  private claims: ClaimsMap | null = null

  // todo(mx): retrieve canonical URI from entity data
  private get wikidataUrl() {
    return `https://www.wikidata.org/entity/${this.entityId}`
  }

  private updateEntityData() {
    this.getEntityData(this.entityId).then((data: {
      label: string
      aliases: string[]
      description: string
      claims: ClaimsMap}) => {
        this.label = data.label
        this.aliases = data.aliases
        this.description = data.description
        this.claims = data.claims

        const related = relatedEntityIds(this.claims)
        this.requestLabels(related)
    })
  }

  private mounted() {
    this.onEntityIdChanged()
  }

  @Watch('entityId')
  private onEntityIdChanged() {
    this.updateEntityData()
  }

  private statements(propertyId: EntityId) {
    if (this.claims) {
      return this.claims.get(propertyId)
    }

    return []
  }
}
</script>

<style lang="less">
  #aliases {
    margin-top: -10px;
    margin-bottom: 0px;
    color: #999999;
  }

  #aliases ul {
    margin-top: -10px;
    margin-bottom: 0px;
  }

  #aliases ul li {
    margin-top: -10px;
    padding-right: 0px;
  }

  #aliases ul li::after {
    content: " |";
  }

  #aliases ul li:last-child::after {
    content: "";
  }

  #description {
    font-size: 1.3em;
  }
</style>
