<template>
  <sqid-bars>
    <template v-slot:mainbar>
	    <h1 v-t="'about.about'" />
      <i18n tag="p" path="about.aboutDescription">
        <a place="kbsGroup" :href="kbsLink">{{ $t('about.kbsGroup') }}</a>
        <a place="tuDresden" href="https://tu-dresden.de/">TU Dresden</a>
        <span place="developersList">Markus Krötzsch, Michael Günther, Markus Damm, Georg Wild</span>
        <span place="lastDeveloper">Maximilian Marx</span>
      </i18n>

	    <h2 v-t="'about.meaning'" />
	    <i18n tag="p" path="about.meaningHypotheses">
	      <ul place="hypotheses">
		      <li>Searching, Querying, and Interacting with Data</li>
		      <li>Sweet QIDs</li>
		      <li>SPARQL Querying Isn't Difficult</li>
		      <li>Surprisingly Quick Information Display</li>
		      <li>See Quality In Data</li>
        </ul>
        <a place="squids" :href="squidLink" v-t="'about.squids'" />
      </i18n>

      <h2 v-t="'about.contribute'" />
      <i18n tag="p" path="about.contributions">
        <a place="githubRepository" href="https://github.com/Wikidata/SQID/">{{ $t('about.githubRepository') }}</a>
        <a place="submitIssue" href="https://github.com/Wikidata/SQID/issues">{{ $t('about.submitIssue') }}</a>
      </i18n>
    </template>
    <template v-slot:sidebar>
      <sqid-image file="Squid_komodo.jpg" width="260" />
      <div style="text-align: center; width: 100%;" v-t="'about.dontEatMe'" />
    </template>
  </sqid-bars>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { siteLinkUrls } from '@/api/wikidata'
import { i18n } from '@/i18n'

@Component
export default class About extends Vue {
  private sitelinks: {[key: string]: string} | null = null

  private created() {
    siteLinkUrls('Q128257').then((urls) => { // Cephalopods
      this.sitelinks = urls
    })
  }

  private get kbsLink() {
    if (i18n.locale === 'de') {
      return 'https://wbs.inf.tu-dresden.de'
    }

    return 'https://kbs.inf.tu-dresden.de'
  }

  private get squidLink() {
    if (this.sitelinks === null) {
      return 'https://en.wikipedia.org/wiki/Cephalopoda'
    }

    const wiki = `${i18n.locale}wiki`

    return this.sitelinks[wiki]
  }
}
</script>
