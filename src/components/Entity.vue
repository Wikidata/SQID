<template>
  <div>
    <h1><span>{{ label }}</span><small> (<a :href="wikidataUrl">{{ entityId }}</a>)</small>
    </h1>
    <ul><li v-for="alias in aliases">{{ alias }}</li></ul>
    <span>{{ description }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { Getter, Action, Mutation, namespace } from 'vuex-class'

@Component
export default class Entity extends Vue {
  @Prop() private entityId!: string
  @Action private getLabel: any
  @Action private getTerms: any
  private label = this.entityId
  private aliases: string[] = []
  private description: string | null = null
  private entityData: any | null = null

  private get wikidataUrl() {
    return `https://www.wikidata.org/entity/${this.entityId}`
  }

  private updateEntityData() {
    this.getTerms(this.entityId).then((terms: {
      label: string,
      aliases: string[],
      description: string }) => {
      this.label = terms.label
      this.aliases = terms.aliases
      this.description = terms.description
    })
  }

  private mounted() {
    this.onEntityIdChanged()
  }

  @Watch('entityId')
  private onEntityIdChanged() {
    this.updateEntityData()
  }
}
</script>
