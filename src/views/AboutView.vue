<template>
  <sqid-bars>
    <template #mainbar>
      <h1>{{ t('about.about') }}</h1>
      <i18n-t tag="p" keypath="about.aboutDescription">
        <template #kbsGroup
          ><a :href="kbsLink">{{ t('about.kbsGroup') }}</a></template
        >
        <template #tuDresden
          ><a href="https://tu-dresden.de">{{ t('about.tuDresden') }}</a></template
        >
        <template #developersList>{{ t('about.developersList') }}</template>
        <template #lastDeveloper>{{ t('about.lastDeveloper') }}</template>
      </i18n-t>

      <h2>{{ t('about.meaning') }}</h2>
      <i18n-t tag="p" keypath="about.meaningHypotheses">
        <template #hypotheses>
          <ul>
            <li>{{ t('about.hypothesis1') }}</li>
            <li>{{ t('about.hypothesis2') }}</li>
            <li>{{ t('about.hypothesis3') }}</li>
            <li>{{ t('about.hypothesis4') }}</li>
            <li>{{ t('about.hypothesis5') }}</li>
          </ul>
        </template>
        <template #squids
          ><a :href="squidLink">{{ t('about.squids') }}</a></template
        >
      </i18n-t>

      <h2>{{ t('about.contribute') }}</h2>
      <i18n-t tag="p" keypath="about.contributions">
        <template #githubRepository>
          <a href=" https://github.com/Wikidata/SQID/"
            >{{ t('about.githubRepository') }}
          </a></template
        >
        <template #submitIssue
          ><a href="https://github.com/Wikidata/SQID/issues"
            >{{ t('about.submitIssue') }}
          </a></template
        >
      </i18n-t>
    </template>
    <template #sidebar>
      <sqid-image file="Squid_komodo.jpg" :width="260" />
      <div style="text-align: center; width: 100%">{{ t('about.dontEatMe') }}</div>
    </template>
  </sqid-bars>
</template>

<script setup lang="ts">
import { siteLinkUrls } from '@/api/wikidata'
import { computed, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

const i18n = useI18n()
const t = i18n.t

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
