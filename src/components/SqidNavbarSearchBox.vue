<template>
  <!-- <vue-bootstrap-autocomplete
    v-model="entitySearch"
    :data="entities"
    :serializer="(s: SearchResult) => `${s.id}: : ${s.label || ''} ( (${s.description || ''}) )`"
    @hit="entitySelected"
    size="sm"
    :placeholder="$t('pageTitle.searchItem')"
    :aria-label="$t('pageTitle.search')"
    ref="navbar-search-box"
  >
    <template slot="append">
      <b-button size="sm" @click="debouncedSearch(entitySearch)"
        ><font-awesome-icon icon="search"
      /></b-button>
    </template>

    <template slot="suggestion" slot-scope="{ data, htmlText }">
      <div><span v-html="workAroundFilter(htmlText)" /></div>
    </template>
  </vue-bootstrap-autocomplete> -->
</template>

<script setup lang="ts">
// import { Component, Model, Watch, Vue } from 'vue-property-decorator'
// import VueBootstrapAutocomplete from '@vue-bootstrap-components/vue-bootstrap-autocomplete'
import { ref } from 'vue'
import _ from 'lodash'

import router from '@/router'
import { searchEntities } from '@/api/wikidata'
import type { SearchResult } from '@/api/types'

const MAX_SEARCH_SUGGESTIONS = 10
const TYPEAHEAD_WORKAROUND_REGEX = /^(.*): : (.*) \( \((.*)\) \)$/

const entitySearch = ref('')
const entities = ref<SearchResult[]>([])

const debouncedSearch = _.debounce(async (search) => {
  try {
    const response = await searchEntities(search, { limit: MAX_SEARCH_SUGGESTIONS })
    entities.value = []
    for (const [_key, entity] of Object.entries(response)) {
      entities.value.push(entity)
    }

    if (search.match(/^P\d+$/)) {
      const properties = await searchEntities(search, {
        limit: MAX_SEARCH_SUGGESTIONS,
        kind: 'property',
      })

      for (const [_key, entity] of Object.entries(properties)) {
        entities.value.push(entity)
      }
    }
  } catch (err) {
    // do nothing
  }
}, 500)

function workAroundFilter(htmlText: string) {
  // vue-bootstrap-typeahead filters results on the serialised values
  // since we don't want to, e.g., exclude Q42 from the results for Q42
  // simply because `Q42' does not appear in the label, so we shuffle
  // things around manually
  // todo(mx): figure out if this is still required
  return htmlText
    .replace(TYPEAHEAD_WORKAROUND_REGEX, '$2 <small>$1</small><br /><small>$3</small>')
    .trim()
}

const entitySelected = (event: Event) => {
  router.push({ name: 'entity', params: { id: event.target.dataset['id'] } })
  entitySearch.value = entitySearch.value.replace(TYPEAHEAD_WORKAROUND_REGEX, '$2').trim()
}
</script>
