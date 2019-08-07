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
          <claim-table :header="$t('entity.hierarchyStatements')"
                       :entityId="entityId"
                       :claims="group('h')"
                       :reverseClaims="reverseGroup('h')" />
          <claim-table :header="$t('entity.humanRelationshipStatements')"
                       :entityId="entityId"
                       :claims="group('f')"
                       :reverseClaims="reverseGroup('f')" />
          <claim-table :header="$t('entity.statements')"
                       :entityId="entityId"
                       :claims="group('o')"
                       :reverseClaims="reverseGroup('o')" />
          <claim-table :header="$t('entity.mediaStatements')"
                       :entityId="entityId"
                       :claims="group('m')"
                       :reverseClaims="reverseGroup('m')" />
          <claim-table :header="$t('entity.wikiStatements')"
                       :entityId="entityId"
                       :claims="group('w')"
                       :reverseClaims="reverseGroup('w')"/>
        </div>
      </b-col>
      <b-col class="sidebar" lg="3" md="12" sm="12">
        <sqid-image :file="images[0]" width="260" v-if="images" />
        <div id="claims-ids" v-if="groupedClaims">
          <claim-table :header="$t('entity.identifierStatements')"
                       :entityId="entityId"
                       :claims="group('i')" />
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
import ClaimTable from './ClaimTable.vue'
import { Claim } from '@/api/types'
import { relatedEntityIds } from '@/api/wikidata'
import { groupClaims } from '@/api/sqid'

const propertyStatistics = namespace('statistics/properties')

@Component({
  components: {
    'claim-table': ClaimTable,
  }})
export default class Entity extends Vue {
  @Prop() private entityId!: string
  @Action private getEntityData: any
  @Action private getReverseClaims: any
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
  private reverseClaims: ClaimsMap | null = null
  private groupedClaims: Map<PropertyClassification, ClaimsMap> | null = null
  private groupedReverseClaims: Map<PropertyClassification, ClaimsMap> | null = null
  private images: string[] | null = null
  private banner: string | null = null
  private homepage: string | null = null

  // todo(mx): retrieve canonical URI from entity data
  private get wikidataUrl() {
    return `https://www.wikidata.org/entity/${this.entityId}`
  }

  private updateEntityData() {
    this.images = null
    this.banner = null
    this.homepage = null

    const forwardClaims = this.getEntityData(this.entityId)
      .then((data: {
        label: string
        aliases: string[]
        description: string
        claims: ClaimsMap}) => {
          this.label = data.label
          this.aliases = data.aliases
          this.description = data.description
          this.claims = data.claims

          const related = relatedEntityIds(this.claims)
          this.requestLabels({entityIds: related})

          this.images = this.getImages(this.entityId)
          this.banner = this.getBanner(this.entityId)
          this.homepage = this.getHomepage(this.entityId)
        })
    const reverseClaims = this.getReverseClaims(this.entityId)
      .then((claims: ClaimsMap) => {
        this.reverseClaims = claims
      })

    Promise.all([forwardClaims, reverseClaims])
      .then(this.refreshClassification)
      .then(this.regroupClaims)
  }

  private regroupClaims() {
    if (this.claims) {
      this.groupedClaims = groupClaims(this.claims, this.propertyGroups)
    }

    if (this.reverseClaims) {
      this.groupedReverseClaims = groupClaims(this.reverseClaims, this.propertyGroups)
    }
  }

  private created() {
    this.onEntityIdChanged()
  }

  @Watch('entityId')
  private onEntityIdChanged() {
    this.updateEntityData()
  }

  private group(kind: PropertyClassification) {
    if (this.groupedClaims) {
      return this.groupedClaims.get(kind)
    }

    return []
  }

  private reverseGroup(kind: PropertyClassification) {
    if (this.groupedReverseClaims) {
      return this.groupedReverseClaims.get(kind)
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
