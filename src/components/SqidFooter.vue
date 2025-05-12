<template>
  <div id="footer">
    <hr />
    <div class="container-fluid">
      <div class="row justify-content-between">
        <div class="col-md-6">
          <i18n-t keypath="footer.stats" tag="p">
            <template #date>{{ d(statistics.dumpDate, 'date', locale) }} </template>
            <template #link
              ><router-link :to="{ name: 'status' }">{{ t('footer.statLink') }}</router-link>
            </template>
          </i18n-t>
        </div>
        <div class="col-md-6">
          <i18n-t keypath="footer.poweredBy" tag="p">
            <template #wdtk>
              <a href="https://github.com/Wikidata/Wikidata-Toolkit">{{
                t('footer.wdtk')
              }}</a></template
            >
            <template #wdqs>
              <a href="https://query.wikidata.org/">{{ t('footer.wdqs') }}</a></template
            >
          </i18n-t>
          <i18n-t keypath="footer.sourceCode" tag="p">
            <template #github>
              <a href="https://github.com/Wikidata/SQID">{{ t('footer.github') }}</a>
            </template>
          </i18n-t>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useStatisticsStore } from '@/stores/statistics'

const { t, d, locale } = useI18n()

const statistics = useStatisticsStore()

// todo(mx): find out if we still need to (i) setup the translation here,
// and (ii) refresh the statistics
</script>

<style>
#footer {
  text-align: center;
}
</style>
