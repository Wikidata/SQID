<template>
  <vue-bootstrap-typeahead
    v-model="entitySearch"
    :data="entities"
    :serializer="s => `${s.id}: : ${s.label || ''} ( (${s.description || ''}) )`"
    @hit="onSelectedEntity($event)"
    size="sm"
    :placeholder="$t('pageTitle.searchItem')"
    :aria-label="$t('pageTitle.search')"
    ref="navbar-search-box">
    <template slot="append">
      <b-button
        size="sm"
        @click="onEntitySearch(entitySearch)"><font-awesome-icon icon="search" /></b-button>
    </template>

    <template slot="suggestion" slot-scope="{ data, htmlText }">
      <div><span v-html="workAroundFilter(htmlText)" /></div>
    </template>
  </vue-bootstrap-typeahead>
</template>

<script lang="ts">
import { Component, Model, Watch, Vue } from 'vue-property-decorator'
import VueBootstrapTypeahead from 'vue-bootstrap-typeahead'
import _ from 'lodash'

import router from '@/router'
import { searchEntities } from '@/api/wikidata'

const TYPEAHEAD_WORKAROUND_REGEX = /^(.*): : (.*) \( \((.*)\) \)$/

@Component({
  components: {
    VueBootstrapTypeahead,
  },
})
export default class AppNavbarSearchBox extends Vue {
  private entitySearch: string = ''
  private entities: any[] = []
  private searchEntities = _.debounce(async function(this: AppNavbarSearchBox, search) {
    try {
      const response = await searchEntities(search, { limit: 10 })
      this.entities = []
      for (const [key, entity] of Object.entries(response)) {
        this.entities.push(entity)
      }

      if (search.match(/^P\d+$/)) {
        const properties = await searchEntities(search, { limit: 10,
                                                          kind: 'property',
                                                        })

        for (const [key, entity] of Object.entries(properties)) {
          this.entities.push(entity)
        }
      }

    } catch (err) {
      // do nothing
    }

  }, 500)

  private workAroundFilter(htmlText: string) {
    // vue-bootstrap-typeahead filters results on the serialised values
    // since we don't want to, e.g., exclude Q42 from the results for Q42
    // simply because `Q42' does not appear in the label, so we shuffle
    // things around manually
    return htmlText.replace(TYPEAHEAD_WORKAROUND_REGEX,
                            '$2 <small>$1</small><br /><small>$3</small>').trim()
  }

  @Watch('entitySearch', {})
  private onEntitySearch(search: any) {
    this.searchEntities(search)
  }

  private onSelectedEntity(event: any) {
    router.push({ name: 'entity',
                  params: { id: event.id },
                })
    const searchBox: { inputValue: string } = this.$refs['navbar-search-box'] as any
    searchBox.inputValue = searchBox.inputValue.replace(TYPEAHEAD_WORKAROUND_REGEX, '$2').trim()
  }
}
</script>
