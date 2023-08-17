<template>
  <sqid-bars>
    <template #mainbar>
      <h1 v-t="'about.about'" />
      <i18n-t tag="p" keypath="about.aboutDescription">
        <template #kbsGroup><a :href="kbsLink" v-t="'about.kbsGroup'" /></template>
        <template #tuDresden><a href="https://tu-dresden.de">TU Dresden</a></template>
        <template #developersList
          >Markus Krötzsch, Michael Günther, Markus Damm, Georg Wild</template
        >
        <template #lastDeveloper>Maximilian Marx</template>
      </i18n-t>

      <h2 v-t="'about.meaning'" />
      <i18n-t tag="p" keypath="about.meaningHypotheses">
        <template #hypotheses>
          <ul>
            <li>Searching, Querying, and Interacting with Data</li>
            <li>Sweet QIDs</li>
            <li>SPARQL Querying Isn't Difficult</li>
            <li>Surprisingly Quick Information Display</li>
            <li>See Quality In Data</li>
          </ul></template
        >
        <template #squids><a :href="squidLink" v-t="'about.squids'" /></template>
      </i18n-t>

      <h2 v-t="'about.contribute'" />
      <i18n-t tag="p" keypath="about.contributions">
        <template #githubRepository>
          <a href="https://github.com/Wikidata/SQID/" v-t="'about.githubRepository'"
        /></template>
        <template #submitIssue
          ><a href="https://github.com/Wikidata/SQID/issues" v-t="'about.submitIssue'"
        /></template>
      </i18n-t>
    </template>
    <template #sidebar>
      <sqid-image file="Squid_komodo.jpg" :width="260" />
      <div style="text-align: center; width: 100%" v-t="'about.dontEatMe'" />
    </template>
  </sqid-bars>
</template>

<script setup lang="ts">
import { siteLinkUrls } from '@/api/wikidata'
import { computed, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

const i18n = useI18n()

const kbsLink = computed(
  () => `https://${i18n.locale.value === 'de' ? 'wbs' : 'kbs'}.inf.tu-dresden.de`,
)

const squidLink = ref('https://en.wikipedia.org/wiki/Cephalopoda')

watchEffect(async () => {
  const CEPHALOPOD_ITEM = 'Q128257'
  const sitelinks = await siteLinkUrls(CEPHALOPOD_ITEM)
  const wiki = `${i18n.locale.value}wiki`

  squidLink.value = sitelinks[wiki]
})
</script>
