<template>
  <sqid-bars>
    <template v-slot:mainbar>
	    <h1>A fresh look at Wikidata</h1>
      <p>SQID is a fast way to browse and
        query <a href="https://www.wikidata.org/">Wikidata</a>, the
        free knowledge base of Wikipedia. SQID is inspired by Magnus
        Manske's <a href="https://tools.wmflabs.org/reasonator/?">Reasonator</a>,
        but it has a different focus. In particular, information about
        Wikidata classes and properties is prominently shown,
        including derived statistics and query results that are not
        part of Wikidata.  SQID wants to help editors to improve
        Wikidata.</p>

      <p>Example pages:
        <ul>
		      <li><router-link :to="{ name: 'entity', params: { id: 'Q1339' }}">Johann Sebastian Bach</router-link>: classical
		        example of a data-rich item page</li>
		      <li><router-link :to="{ name: 'entity', params: { id: 'Q8072' }}">volcano</router-link>: Wikidata item that is used as a class</li>
		      <li><router-link :to="{ name: 'entity', params: { id: 'Q318' }}">galaxy</router-link>: Wikidata class item that is part of the rather well designed classification of astronomical objects</li>
		      <li><router-link :to="{ name: 'entity', params: { id: 'P21' }}">sex or gender</router-link>: a frequently used Wikidata property</li>
		      <li><router-link :to="{ name: 'entity', params: { id: 'P1303' }}">instrument</router-link>: another interesting Wikidata property</li>
		      <li><router-link :to="{ name: 'entity', params: { id: 'Q18616576' }}">Wikidata property</router-link>: the class of all Wikidata properties; shows how properties are organised in subclasses</li>
        </ul>
      </p>

      <p>
        <b>Properties</b> are special Wikidata entities that are used
        for describing relationships between entities, and for assigning
        many types of data values to entities. You can find all properties
        in SQID's <b><a href="#/browse?type=properties">property
            browser</a></b>.
      </p>
      <p>
      <b>Classes</b> are Wikidata items that are used as the value in
      an <a href="#/view?id=P31">instance-of</a> statement, or that are
      subject or value in a <a href="#/view?id=P279">subclass-of</a>
      statement. You can find all classes in
      SQID's <b><a href="#/browse?type=classes">classes browser</a></b>.
      </p>
      <p>Most data shown by SQID is <b>live data</b> taken from the <a href="https://www.wikidata.org/w/api.php">Wikidata API</a> or the <a href="https://query.wikidata.org/">Wikidata SPARQL query service</a>.
        Complex statistics that cannot currently be computed live are pre-computed from the weekly data dumps using
        <a href="https://github.com/Wikidata/Wikidata-Toolkit">Wikidata Toolkit</a>.
        Some complex statistics can be fetched from SPARQL, but take too long to compute in the browser. These are
        updated every hour. See the <b><router-link :to="{ name: 'status' }">status page</router-link></b> for recency information and statistics on the current data.</p>
    </template>
    <template v-slot:sidebar>
      <sqid-image :file="'Cephalop.jpg'" :width="260" />
    </template>
  </sqid-bars>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import SqidImage from '@/components/SqidImage.vue'

@Component({
  components: {
    SqidImage,
  },
})
export default class Home extends Vue {}
</script>
