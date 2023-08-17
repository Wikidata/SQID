<template>
  <div id="footer">
    <hr />
    <div class="container-fluid">
      <div class="row justify-content-between">
        <div class="col-md-6">
          <p>
            {{ t('footer.statDate', { date: d(statistics.dumpDate) }) }} (<router-link
              :to="{ name: 'status' }"
              >{{ t('footer.statLink') }}</router-link
            >)
          </p>
        </div>
        <div class="col-md-6">
          <p>
            {{ $t('footer.poweredBy') }}
            <a href="https://github.com/Wikidata/Wikidata-Toolkit">Wikidata toolkit</a> &amp;
            <a href="https://query.wikidata.org/">Wikidata SPARQL Query</a>
          </p>
          <i18n-t keypath="footer.sourceCode" tag="p">
            <a href="https://github.com/Wikidata/SQID">Github</a>
          </i18n-t>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
#footer {
  text-align: center;
}
</style>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useStatisticsStore } from '@/stores/statistics'

const { t, d } = useI18n()

const statistics = useStatisticsStore()

// todo(mx): find out if we still need to (i) setup the translation here,
// and (ii) refresh the statistics
</script>
