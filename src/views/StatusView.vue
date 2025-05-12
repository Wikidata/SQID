<template>
  <sqid-bars>
    <template #mainbar>
      <h1>{{ t('status.status') }}</h1>
      <p>{{ t('status.statusOverview') }}</p>
      <b-card
        :title="t('status.statistics')"
        :subtitle="t('status.statsBasedOn', { date: d(statistics.dumpDate, 'date', locale) })"
      >
        <table class="table table-striped">
          <thead>
            <tr>
              <th></th>
              <th>{{ t('status.items') }}</th>
              <th>{{ t('status.properties') }}</th>
              <th>{{ t('status.totals') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>{{ t('status.numbers') }}</th>
              <td>{{ items.count }}</td>
              <td>{{ properties.count }}</td>
              <td>{{ items.count + properties.count }}</td>
            </tr>
            <tr>
              <th>{{ t('status.statements') }}</th>
              <td>{{ items.countStatements }}</td>
              <td>{{ properties.countStatements }}</td>
              <td>{{ items.countStatements + properties.countStatements }}</td>
            </tr>
            <tr>
              <th>{{ t('status.labels') }}</th>
              <td>{{ items.countLabels }}</td>
              <td>{{ properties.countLabels }}</td>
              <td>{{ items.countLabels + properties.countLabels }}</td>
            </tr>
            <tr>
              <th>{{ t('status.descriptions') }}</th>
              <td>{{ items.countDescriptions }}</td>
              <td>{{ properties.countDescriptions }}</td>
              <td>{{ items.countDescriptions + properties.countDescriptions }}</td>
            </tr>
            <tr>
              <th>{{ t('status.aliases') }}</th>
              <td>{{ items.countAliases }}</td>
              <td>{{ properties.countAliases }}</td>
              <td>{{ items.countAliases + properties.countAliases }}</td>
            </tr>
            <tr>
              <th>{{ t('status.sitelinks') }}</th>
              <td>{{ statistics.sitelinks }}</td>
              <td>{{ t('status.defaultNumber') }}</td>
              <td>{{ statistics.sitelinks }}</td>
            </tr>
          </tbody>
        </table>
      </b-card>
      <b-card :title="t('status.freshness')" :subtitle="t('status.refreshCycle')">
        <table class="table table-striped number-table">
          <tbody>
            <tr>
              <th>{{ t('status.dumpDate') }}</th>
              <td>{{ d(statistics.dumpDate, 'date', locale) }}</td>
            </tr>
            <tr>
              <th>{{ t('status.propertyDate') }}</th>
              <td>{{ d(statistics.propertiesDate, 'time', locale) }}</td>
            </tr>
            <tr>
              <th>{{ t('status.classDate') }}</th>
              <td>{{ d(statistics.classesDate, 'time', locale) }}</td>
            </tr>
            <tr>
              <th>{{ t('status.clientDate') }}</th>
              <td>{{ d(statistics.refreshedDate, 'time', locale) }}</td>
            </tr>
          </tbody>
        </table>
      </b-card>
    </template>
    <template #sidebar>
      <sqid-image file="Sepia_officinalis_(aquarium).jpg" :width="260" />
      <div>{{ t('status.refreshedRecently') }}</div>
    </template>
  </sqid-bars>
</template>

<script setup lang="ts">
import { useStatisticsStore } from '@/stores/statistics'
import { useStatisticsItemsStore } from '@/stores/statistics-items'
import { useStatisticsPropertiesStore } from '@/stores/statistics-properties'
import { useI18n } from 'vue-i18n'

const { t, d, locale } = useI18n()

const statistics = useStatisticsStore()
const items = useStatisticsItemsStore()
const properties = useStatisticsPropertiesStore()

statistics.refresh()
</script>

<style scoped>
table {
  margin-bottom: 0px;
}

td,
th {
  text-align: right;
  width: 15%;
}

.sidebar div {
  text-align: center;
  width: 100%;
}
</style>
