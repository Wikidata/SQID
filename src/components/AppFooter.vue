<template>
  <div id="footer">
    <hr />
    <div class="container-fluid">
      <div class="row justify-content-between">
        <div class="col-md-6">
          <p>{{ $t('footer.statDate', { date: $d(statsDate) }) }}
          (<router-link :to="{ name: 'status'}">{{ $t('footer.statLink') }}</router-link>)</p>
        </div>
        <div class="col-md-6">
          <p>{{ $t('footer.poweredBy') }}
            <a href="https://github.com/Wikidata/Wikidata-Toolkit">Wikidata toolkit</a> &amp;
            <a href="https://query.wikidata.org/">Wikidata SPARQL Query</a>
          </p>
          <i18n path="footer.sourceCode" tag="p">
            <a href="https://github.com/Wikidata/SQID">Github</a>
          </i18n>
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

<script lang="ts">
import { Component, Watch, Vue } from 'vue-property-decorator'
import { Action, Getter, namespace } from 'vuex-class'

const statistics = namespace('statistics')

@Component
export default class AppFooter extends Vue {
  @statistics.Getter('dumpTimestamp') private statsDate!: number
  @statistics.Action('refresh') private refreshStatistics!: any
  @Action private setCurrentTranslation!: any

  private created() {
    this.onRouteChanged()
  }

  @Watch('$route')
  private onRouteChanged() {
    this.refreshStatistics()
    this.setCurrentTranslation()
  }
}
</script>
