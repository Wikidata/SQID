<template>
  <sqid-bars>
    <template #mainbar>
      <h1 v-t="'home.home'" />
      <i18n-t tag="p" keypath="home.description">
        <template #wikidata
          ><a place="wikidata" href="https://www.wikidata.org" v-t="'home.wikidata'"
        /></template>
        <template #reasonator
          ><a place="reasonator" href="https://reasonator.toolforge.org/?" v-t="'home.reasonator'"
        /></template>
      </i18n-t>
      <div>
        <span v-t="'home.examples'" />
        <ul>
          <i18n-t tag="li" keypath="home.examplesBach"
            ><template #bach><entity-link entityId="Q1339" /></template
          ></i18n-t>
          <i18n-t tag="li" keypath="home.examplesVolcano"
            ><template #volcano><entity-link entityId="Q8072" /></template
          ></i18n-t>
          <i18n-t tag="li" keypath="home.examplesGalaxy"
            ><template #galaxy><entity-link entityId="Q318" /></template
          ></i18n-t>
          <i18n-t tag="li" keypath="home.examplesSexOrGender"
            ><template #sexOrGender><entity-link entityId="P21" /></template
          ></i18n-t>
          <i18n-t tag="li" keypath="home.examplesInstrument"
            ><template #instrument><entity-link entityId="P1303" /></template
          ></i18n-t>
          <i18n-t tag="li" keypath="home.examplesProperty"
            ><template #property><entity-link entityId="Q18616576" /></template
          ></i18n-t>
        </ul>
      </div>

      <i18n-t tag="p" keypath="home.propertiesDescription">
        <template #properties><b v-t="'home.properties'" /></template>
        <template #propertyBrowser
          ><router-link :to="{ name: 'properties' }">
            <b v-t="'home.propertyBrowser'" /> </router-link
        ></template>
      </i18n-t>

      <i18n-t tag="p" keypath="home.classesDescription">
        <template #classes><b v-t="'home.classes'" /></template>
        <template #instanceOf><entity-link entityId="P31" /></template>
        <template #subclassOf><entity-link entityId="P279" /></template>
        <template #classBrowser
          ><router-link :to="{ name: 'classes' }"> <b v-t="'home.classBrowser'" /> </router-link
        ></template>
      </i18n-t>

      <i18n-t tag="p" keypath="home.data">
        <template #liveData><b v-t="'home.liveData'" /></template>
        <template #wikidataAPI
          ><a
            place="wikidataAPI"
            href="https://www.wikidata.org/w/api.php"
            v-t="'home.wikidataAPI'"
        /></template>
        <template #wdqs
          ><a place="wdqs" href="https://query.wikidata.org/" v-t="'home.wdqs'"
        /></template>
        <template #wdtk
          ><a place="wdtk" href="https://github.com/Wikidata/Wikidata-Toolkit" v-t="'home.wdtk'"
        /></template>
        <template #statusPage
          ><router-link :to="{ name: 'status' }"> <b v-t="'home.statusPage'" /> </router-link
        ></template>
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

const i18n = useI18n()

watchEffect(async () => {
  const entitiesTerms = useEntitiesTermsStore()

  await entitiesTerms.requestLabels({
    entityIds: ['Q1339', 'Q8072', 'Q318', 'P21', 'P1303', 'Q18616576', 'P31', 'P279'],
    lang: i18n.locale.value,
  })
})
</script>
