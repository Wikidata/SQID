<template>
  <sqid-bars>
    <template v-slot:mainbar>
      <template v-if="id">
        <h1>
          <i18n path="errors.noSuchEntity">
            <span place="entityId">{{ id }}</span>
          </i18n>&nbsp;<small>(<a :href="wikidata">{{ id }}</a>)</small>
        </h1>
        <i18n tag="div" path="errors.noSuchEntityDescription" />
      </template>
      <template v-else>
        <i18n tag="h1" path="errors.pageNotFound" />
        <i18n tag="div" path="errors.pageNotFoundDescription" />
      </template>
    </template>
    <template v-slot:sidebar>
      <sqid-image file="Colossal octopus by Pierre Denys de Montfort.jpg" width="260" />
    </template>
  </sqid-bars>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { EntityId } from '@/api/types'

@Component
export default class NotFoundView extends Vue {
  @Prop(String) protected readonly id: EntityId | undefined
  @Getter private getWikidataUrl: any

  private get wikidata() {
    if (this.id) {
      return this.getWikidataUrl(this.id)
    }
  }
}
</script>
