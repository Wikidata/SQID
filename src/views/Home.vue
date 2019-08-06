<template>
  <sqid-bars>
    <template v-slot:mainbar>
	    <h1 v-t="'home.home'" />
      <i18n tag="p" path="home.description">
        <a place="wikidata" href="https://www.wikidata.org">{{ $t('home.wikidata') }}</a>
        <a place="reasonator" href="https://tools.wmflabs.org/reasonator/?">{{ $t('home.reasonator') }}</a>
      </i18n>
      <p>{{ $t('home.examples') }}
        <ul>
		      <i18n tag="li" path="home.examplesBach"><entity-link place="bach" entityId="Q1339" /></i18n>
          <i18n tag="li" path="home.examplesVolcano"><entity-link place="volcano" entityId="Q8072" /></i18n>
          <i18n tag="li" path="home.examplesGalaxy"><entity-link place="galaxy" entityId="Q318" /></i18n>
          <i18n tag="li" path="home.examplesSexOrGender"><entity-link place="sexOrGender" entityId="P21" /></i18n>
          <i18n tag="li" path="home.examplesInstrument"><entity-link place="instrument" entityId="P1303" /></i18n>
          <i18n tag="li" path="home.examplesProperty"><entity-link place="property" entityId="Q18616576" /></i18n>
        </ul>
      </p>

      <i18n tag="p" path="home.propertiesDescription">
        <b place="properties" v-t="'home.properties'" />
        <router-link place="propertyBrowser" :to="{name: 'properties'}">
          <b v-t="'home.propertyBrowser'" />
        </router-link>
      </i18n>

      <i18n tag="p" path="home.classesDescription">
        <b place="classes" v-t="'home.classes'" />
        <entity-link place="instanceOf" entityId="P31" />
        <entity-link place="subclassOf" entityId="P279" />
        <router-link place="classBrowser" :to="{name: 'classes'}">
          <b v-t="'home.classBrowser'" />
        </router-link>
      </i18n>

      <i18n tag="p" path="home.data">
        <b place="liveData" v-t="'home.liveData'" />
        <a place="wikidataAPI" href="https://www.wikidata.org/w/api.php">{{ $t('home.wikidataAPI') }}</a>
        <a place="wdqs" href="https://query.wikidata.org/">{{ $t('home.wdqs') }}</a>
        <a place="wdtk" href="https://github.com/Wikidata/Wikidata-Toolkit">{{ $t('home.wdtk') }}</a>
        <router-link place="statusPage" :to="{name: 'status'}">
          <b v-t="'home.statusPage'" />
        </router-link>
      </i18n>
    </template>
    <template v-slot:sidebar>
      <sqid-image :file="'Cephalop.jpg'" :width="260" />
    </template>
  </sqid-bars>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Action } from 'vuex-class'
import { i18n } from '@/i18n'

@Component
export default class Home extends Vue {
  @Action private requestLabels: any

  private get language() {
    return i18n.locale
  }

  @Watch('language')
  private updateLanguage() {
    this.requestLabels({
      entityIds: ['Q1339', 'Q8072', 'Q318', 'P21', 'P1303', 'Q18616576', 'P31', 'P279'],
      lang: this.language,
    })
  }

  private created() {
    this.updateLanguage()
  }
}
</script>
