<template>
  <sqid-bars>
    <template v-slot:mainbar>
			<h1 v-t="'status.status'" />
			<p v-t="'status.statusOverview'" />
      <b-card :title="$t('status.statistics')"
              :sub-title="$t('status.statsBasedOn', { date: $d(dumpTimestamp) })">
        <table class="table table-striped">
          <thead>
            <tr>
              <th></th>
              <th v-t="'status.items'" />
              <th v-t="'status.properties'" />
              <th v-t="'status.totals'" />
            </tr>
          </thead>
          <tbody>
            <tr>
              <th v-t="'status.numbers'" />
              <td>{{ itemCount }}</td>
              <td>{{ propertyCount }}</td>
              <td>{{ itemCount + propertyCount }}</td>
            </tr>
            <tr>
              <th v-t="'status.statements'" />
              <td>{{ itemStatements }}</td>
              <td>{{ propertyStatements }}</td>
              <td>{{ itemStatements + propertyStatements }}</td>
            </tr>
            <tr>
              <th v-t="'status.labels'" />
              <td>{{ itemLabels }}</td>
              <td>{{ propertyLabels }}</td>
              <td>{{ itemLabels + propertyLabels }}</td>
            </tr>
            <tr>
              <th v-t="'status.descriptions'" />
              <td>{{ itemDescriptions }}</td>
              <td>{{ propertyDescriptions }}</td>
              <td>{{ itemDescriptions + propertyDescriptions }}</td>
            </tr>
            <tr>
              <th v-t="'status.aliases'" />
              <td>{{ itemAliases }}</td>
              <td>{{ propertyAliases }}</td>
              <td>{{ itemAliases + propertyAliases }}</td>
            </tr>
            <tr>
              <th v-t="'status.sitelinks'" />
              <td>{{ siteLinkCount }}</td>
              <td>0</td>
              <td>{{ siteLinkCount }}</td>
            </tr>
          </tbody>
        </table>
      </b-card>
      <b-card :title="$t('status.freshness')"
              :sub-title="$t('status.refreshCycle')">
        <table class="table table-striped number-table">
          <tbody>
            <tr>
              <th v-t="'status.dumpDate'" />
              <td>{{ $d(dumpTimestamp) }}</td>
            </tr>
            <tr>
              <th v-t="'status.propertyDate'" />
              <td>{{ $d(propertiesTimestamp, 'time') }}</td>
            </tr>
            <tr>
              <th v-t="'status.classDate'" />
              <td>{{ $d(classesTimestamp, 'time') }}</td>
            </tr>
            <tr>
              <th v-t="'status.clientDate'" />
              <td>{{ $d(lastRefresh, 'time') }}</td>
            </tr>
          </tbody>
        </table>
      </b-card>
    </template>
    <template v-slot:sidebar>
			<sqid-image file="Sepia_officinalis_(aquarium).jpg" width="260" />
			<div style="text-align: center; width: 100%;" v-t="'status.refreshedRecently'" />
    </template>
  </sqid-bars>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, Getter, namespace } from 'vuex-class'

const statistics = namespace('statistics')
const items = namespace('statistics/items')
const properties = namespace('statistics/properties')

@Component
export default class Status extends Vue {
  @statistics.Getter private dumpTimestamp!: number
  @statistics.Getter private classesTimestamp!: number
  @statistics.Getter private propertiesTimestamp!: number
  @statistics.Getter private lastRefresh!: number
  @statistics.Getter private siteLinkCount!: number
  @items.Getter('count') private itemCount!: number
  @items.Getter('countLabels') private itemLabels!: number
  @items.Getter('countStatements') private itemStatements!: number
  @items.Getter('countDescriptions') private itemDescriptions!: number
  @items.Getter('countAliases') private itemAliases!: number
  @properties.Getter('count') private propertyCount!: number
  @properties.Getter('countLabels') private propertyLabels!: number
  @properties.Getter('countStatements') private propertyStatements!: number
  @properties.Getter('countDescriptions') private propertyDescriptions!: number
  @properties.Getter('countAliases') private propertyAliases!: number
}
</script>

<style lang="less" scoped>
table {
  margin-bottom: 0px;
}
td, th {
	text-align: right;
	width: 15%;
}
</style>
