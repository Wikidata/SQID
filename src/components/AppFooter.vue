<template>
  <div>
    <hr />
    <div class="container-fluid">
      <div class="row justify-content-between">
        <div class="col-md-6">
          <p>{{ $t('footer.statDate', { date: $d(statsDate) }) }}
          (<router-link to="/status">{{ $t('footer.statLink') }}</router-link>)</p>
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

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class AppFooter extends Vue {
  private get statsDate(): Date {
    return new Date(0)
  }
}
</script>
