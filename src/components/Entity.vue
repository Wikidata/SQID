<template>
  <b-container>
    <b-row>
      <b-col class="mainbar" lg="9" md="12" sm="12">
        <div v-if="banner" style="overflow: hidden;">
          <sqid-image :file="banner" width="850" />
        </div>
        <h1><span>{{ label }}</span>
          &nbsp;<small>(<a :href="wikidataUrl">{{ entityId }}</a>)</small></h1>
        <div id="aliases">
          <ul class="list-inline">
            <li class="list-inline-item" v-for="alias in aliases" :key="alias.value">{{ alias }}</li>
          </ul>
        </div>
        <div id="description">{{ description }}</div>
        <div id="claims" v-if="groupedClaims">
          <table class="table table-striped table-condensed statements-table">
            <tbody>
              <claim-group :entityId="entityId" :propertyId="prop" :claims="statements(prop)" v-for="prop in group('h')" :key="prop" />
              <claim-group :entityId="entityId" :propertyId="prop" :claims="statements(prop)" v-for="prop in group('f')" :key="prop" />
              <claim-group :entityId="entityId" :propertyId="prop" :claims="statements(prop)" v-for="prop in group('o')" :key="prop" />
              <claim-group :entityId="entityId" :propertyId="prop" :claims="statements(prop)" v-for="prop in group('w')" :key="prop" />
              <claim-group :entityId="entityId" :propertyId="prop" :claims="statements(prop)" v-for="prop in group('m')" :key="prop" />
            </tbody>
          </table>
        </div>
      </b-col>
      <b-col class="sidebar" lg="3" md="12" sm="12">
        <sqid-image :file="images[0]" width="260" v-if="images" />
        <div id="claims-ids" v-if="groupedClaims">
          <table class="table table-striped table-condensed statements-table">
            <tbody>
              <claim-group :entityId="entityId" :propertyId="prop" :claims="statements(prop)" v-for="prop in group('i')" :key="prop" />
            </tbody>
          </table>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { Getter, Action, Mutation, namespace } from 'vuex-class'
import { ClaimsMap, EntityId } from '@/store/entity/claims/types'
import { PropertyClassification } from '@/store/statistics/properties/types'
import ClaimGroup from './ClaimGroup.vue'
import SqidImage from './SqidImage.vue'
import { relatedEntityIds } from '@/api/wikidata'

const propertyStatistics = namespace('statistics/properties')

@Component({
  components: {
    'claim-group': ClaimGroup,
    'sqid-image': SqidImage,
  }})
export default class Entity extends Vue {
  @Prop() private entityId!: string
  @Action private getEntityData: any
  @Action private requestLabels: any
  @propertyStatistics.Action private refreshClassification: any
  @propertyStatistics.Getter private propertyGroups!: (entityId: EntityId) => PropertyClassification
  @Getter private getImages: any
  @Getter private getBanner: any
  @Getter private getHomepage: any
  private label = this.entityId
  private aliases: string[] = []
  private description: string | null = null
  private claims: ClaimsMap | null = null
  private groupedClaims: Map<PropertyClassification, EntityId[]> | null = null
  private images: string | null = null
  private banner: string | null = null
  private homepage: string | null = null

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

        this.images = this.getImages(this.entityId)
        this.banner = this.getBanner(this.entityId)
        this.homepage = this.getHomepage(this.entityId)
      })
      .then(this.refreshClassification).then(() => {
        if (this.claims) {
          const groupedClaims = new Map<PropertyClassification, EntityId[]>()

          for (const prop of this.claims.keys()) {
            const kind = this.propertyGroups(prop)
            let group = groupedClaims.get(kind)

            if (group === undefined) {
              group = []
            }

            group.push(prop)

            groupedClaims.set(kind, group)
          }

          this.groupedClaims = groupedClaims
        }
      })
  }

  private created() {
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

  private group(kind: PropertyClassification) {
    if (this.groupedClaims) {
      return this.groupedClaims.get(kind)
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
