<template>
  <h1><span>{{ label }}</span><small> (<a :href="wikidataUrl">{{ entityId }}</a>)</small>
  </h1>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { Getter, Action, Mutation, namespace } from 'vuex-class'

@Component
export default class Entity extends Vue {
  @Prop() private entityId!: string
  @Action private getLabel: any
  private label = this.entityId

  private get wikidataUrl() {
    return `https://www.wikidata.org/entity/${this.entityId}`
  }

  @Watch('entityId')
  private onEntityIdChanged() {
    this.getLabel(this.entityId).then((label: string) => {
      this.label = label
    })
  }
}
</script>
