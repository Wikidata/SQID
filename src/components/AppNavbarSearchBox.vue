<template>
<vue-bootstrap-typeahead
  v-model="entitySearch"
  :data="entities"
  :serializer="s => s.label"
  @hit="onSelectedEntity($event)"
  size="sm"
  placeholder="Search item"
  aria-label="Search">
  <template slot="append">
    <b-button
      size="sm"
      @click="onEntitySearch(entitySearch)"><font-awesome-icon icon="search" /></b-button>
  </template>

  <template slot="suggestion" slot-scope="{ data, htmlText }">
    <div><span v-html="htmlText"></span>&nbsp;<small>({{ data.id }})</small>
      <br /><small>{{ data.description }}</small></div>
  </template>
</vue-bootstrap-typeahead>
</template>

<script lang="ts">
import { Component, Model, Watch, Vue } from 'vue-property-decorator'
import VueBootstrapTypeahead from 'vue-bootstrap-typeahead'
import _ from 'lodash'

import router from '@/router'
import { searchEntities } from '@/api/wikidata'

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
      const response = await searchEntities(search, { limit: 10 } )

      this.entities = []
      for (const [key, entity] of Object.entries(response)) {
        this.entities.push(entity)
      }
    } catch (err) {
      // do nothing
    }

  }, 500)

  @Watch('entitySearch', {})
  private onEntitySearch(search: any) {
    this.searchEntities(search)
  }

  private onSelectedEntity(event: any) {
    router.push({ name: 'entity',
                  params: { id: event.id },
                })
  }
}
</script>
