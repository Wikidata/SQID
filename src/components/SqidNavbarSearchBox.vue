<template>
  <b-nav-form>
    <b-form-input
      id="search"
      v-model="needle"
      type="text"
      :placeholder="t('pageTitle.searchItem')"
    />
  </b-nav-form>
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
import { ref, watchEffect } from 'vue'
//import _ from 'lodash'

import { searchEntities } from '@/api/wikidata'
import type { SearchResult } from '@/api/types'

import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { refDebounced } from '@vueuse/core'

const { t } = useI18n()
const _router = useRouter()

interface Props {
  delay?: number
  wait?: number
  minCharacters?: number
  maxSuggestions?: number
}

const props = withDefaults(defineProps<Props>(), {
  delay: 500,
  wait: 1000,
  minCharacters: 3,
  maxSuggestions: 10,
})

const search = ref('')
const needle = refDebounced(search, props.delay, { maxWait: props.wait })
const candidates = ref<SearchResult[]>([])

watchEffect(async () => {
  try {
    if (needle.value.length < props.minCharacters) {
      return
    }

    const items = searchEntities(needle.value, { limit: props.maxSuggestions })
    const properties = needle.value.match(/^P\d+$/)
      ? searchEntities(needle.value, {
          limit: props.maxSuggestions,
          kind: 'property',
        })
      : Promise.resolve([])

    candidates.value = (await properties).concat(await items)
  } catch (_err) {
    // do nothing
  }
})

// const debouncedSearch = _.debounce(async (search) => {
//   try {
//     const response = await searchEntities(search, { limit: props.maxSuggestions })
//     entities.value = []
//     for (const [_key, entity] of Object.entries(response)) {
//       entities.value.push(entity)
//     }
//
//     if (search.match(/^P\d+$/)) {
//       const properties = await searchEntities(search, {
//         limit: props.maxSuggestions,
//         kind: 'property',
//       })
//
//       for (const [_key, entity] of Object.entries(properties)) {
//         entities.value.push(entity)
//       }
//     }
//   } catch (err) {
//     // do nothing
//   }
// }, 500)
//
// const entitySelected = (event: Event) => {
//   router.push({ name: 'entity', params: { id: event.target.dataset['id'] } })
//   entitySearch.value = entitySearch.value.replace(TYPEAHEAD_WORKAROUND_REGEX, '$2').trim()
// }
</script>
