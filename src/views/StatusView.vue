<template>
  <sqid-bars>
    <template #mainbar>
      <h1 v-t="'status.status'" />
      <p v-t="'status.statusOverview'" />
      <b-card
        :title="t('status.statistics')"
        :sub-title="t('status.statsBasedOn', { date: d(statistics.dumpDate) })"
      >
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
              <td>{{ items.count }}</td>
              <td>{{ properties.count }}</td>
              <td>{{ items.count + properties.count }}</td>
            </tr>
            <tr>
              <th v-t="'status.statements'" />
              <td>{{ items.countStatements }}</td>
              <td>{{ properties.countStatements }}</td>
              <td>{{ items.countStatements + properties.countStatements }}</td>
            </tr>
            <tr>
              <th v-t="'status.labels'" />
              <td>{{ items.countLabels }}</td>
              <td>{{ properties.countLabels }}</td>
              <td>{{ items.countLabels + properties.countLabels }}</td>
            </tr>
            <tr>
              <th v-t="'status.descriptions'" />
              <td>{{ items.countDescriptions }}</td>
              <td>{{ properties.countDescriptions }}</td>
              <td>{{ items.countDescriptions + properties.countDescriptions }}</td>
            </tr>
            <tr>
              <th v-t="'status.aliases'" />
              <td>{{ items.countAliases }}</td>
              <td>{{ properties.countAliases }}</td>
              <td>{{ items.countAliases + properties.countAliases }}</td>
            </tr>
            <tr>
              <th v-t="'status.sitelinks'" />
              <td>{{ statistics.sitelinks }}</td>
              <td>0</td>
              <td>{{ statistics.sitelinks }}</td>
            </tr>
          </tbody>
        </table>
      </b-card>
      <b-card :title="t('status.freshness')" :sub-title="t('status.refreshCycle')">
        <table class="table table-striped number-table">
          <tbody>
            <tr>
              <th v-t="'status.dumpDate'" />
              <td>{{ d(statistics.dumpDate) }}</td>
            </tr>
            <tr>
              <th v-t="'status.propertyDate'" />
              <td>{{ d(statistics.propertiesDate, 'time') }}</td>
            </tr>
            <tr>
              <th v-t="'status.classDate'" />
              <td>{{ d(statistics.classesDate, 'time') }}</td>
            </tr>
            <tr>
              <th v-t="'status.clientDate'" />
              <td>{{ d(statistics.refreshedDate, 'time') }}</td>
            </tr>
          </tbody>
        </table>
      </b-card>
    </template>
    <template #sidebar>
      <sqid-image file="Sepia_officinalis_(aquarium).jpg" :width="260" />
      <div style="text-align: center; width: 100%" v-t="'status.refreshedRecently'" />
    </template>
  </sqid-bars>
</template>

<script setup lang="ts">
import { useStatisticsStore } from '@/stores/statistics'
import { useStatisticsItemsStore } from '@/stores/statistics-items'
import { useStatisticsPropertiesStore } from '@/stores/statistics-properties'
import { useI18n } from 'vue-i18n'

const { t, d } = useI18n()

const statistics = useStatisticsStore()
const items = useStatisticsItemsStore()
const properties = useStatisticsPropertiesStore()

statistics.refresh()
</script>

<style lang="less" scoped>
table {
  margin-bottom: 0px;
}
td,
th {
  text-align: right;
  width: 15%;
}
</style>
