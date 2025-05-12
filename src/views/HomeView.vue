<template>
  <sqid-bars>
    <template #mainbar>
      <h1>{{ t('home.home') }}</h1>
      <i18n-t tag="p" keypath="home.description">
        <template #wikidata
          ><a href="https://www.wikidata.org">{{ t('home.wikidata') }}</a></template
        >
        <template #reasonator
          ><a href="https://reasonator.toolforge.org/?">{{ t('home.reasonator') }}</a></template
        >
      </i18n-t>
      <div>
        <h2>{{ t('home.examples') }}</h2>
        <ul>
          <i18n-t tag="li" keypath="home.examplesBach"
            ><template #bach><sqid-entity-link entity-id="Q1339" /></template
          ></i18n-t>
          <i18n-t tag="li" keypath="home.examplesVolcano"
            ><template #volcano><sqid-entity-link entity-id="Q8072" /></template
          ></i18n-t>
          <i18n-t tag="li" keypath="home.examplesGalaxy"
            ><template #galaxy><sqid-entity-link entity-id="Q318" /></template
          ></i18n-t>
          <i18n-t tag="li" keypath="home.examplesSexOrGender"
            ><template #sexOrGender><sqid-entity-link entity-id="P21" /></template
          ></i18n-t>
          <i18n-t tag="li" keypath="home.examplesInstrument"
            ><template #instrument><sqid-entity-link entity-id="P1303" /></template
          ></i18n-t>
          <i18n-t tag="li" keypath="home.examplesProperty"
            ><template #property><sqid-entity-link entity-id="Q18616576" /></template
          ></i18n-t>
        </ul>
      </div>

      <h2>{{ t('home.properties') }}</h2>
      <i18n-t tag="p" keypath="home.propertiesDescription">
        <template #properties>{{ t('home.properties') }}</template>
        <template #propertyBrowser
          ><router-link :to="{ name: 'properties' }">
            <b>{{ t('home.propertyBrowser') }}</b>
          </router-link></template
        >
      </i18n-t>

      <h2>{{ t('home.classes') }}</h2>
      <i18n-t tag="p" keypath="home.classesDescription">
        <template #classes>{{ t('home.classes') }}</template>
        <template #instanceOf><sqid-entity-link entity-id="P31" /></template>
        <template #subclassOf><sqid-entity-link entity-id="P279" /></template>
        <template #classBrowser
          ><router-link :to="{ name: 'classes' }">
            <b>{{ t('home.classBrowser') }}</b>
          </router-link></template
        >
      </i18n-t>

      <h2>{{ t('home.theData') }}</h2>
      <i18n-t tag="p" keypath="home.data">
        <template #liveData
          ><b>{{ t('home.liveData') }}</b></template
        >
        <template #wikidataAPI
          ><a href="https://www.wikidata.org/w/api.php">{{ t('home.wikidataAPI') }}</a></template
        >
        <template #wdqs
          ><a href="https://query.wikidata.org/">{{ t('home.wdqs') }}</a></template
        >
        <template #wdtk
          ><a href="https://github.com/Wikidata/Wikidata-Toolkit">{{ t('home.wdtk') }}</a></template
        >
        <template #statusPage
          ><router-link :to="{ name: 'status' }">
            <b>{{ t('home.statusPage') }}</b>
          </router-link></template
        >
      </i18n-t>
    </template>
    <template #sidebar>
      <sqid-image file="Cephalop.jpg" :width="260" />
    </template>
  </sqid-bars>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEntitiesTermsStore } from '@/stores/entities-terms'

const { t, locale } = useI18n()

watchEffect(async () => {
  const entitiesTerms = useEntitiesTermsStore()

  await entitiesTerms.requestLabels({
    entityIds: ['Q1339', 'Q8072', 'Q318', 'P21', 'P1303', 'Q18616576', 'P31', 'P279'],
    lang: locale.value,
  })
})
</script>
