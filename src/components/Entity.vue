<template>
  <h1><span>{{ label }}</span><small> (<a :href="wikidataUrl">{{ entityId }}</a>)</small>
  </h1>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter, Action, Mutation, namespace } from 'vuex-class'

@Component
export default class Entity extends Vue {
  @Prop() private entityId!: string
  @Action private getLabel: any
  private label: string | null = null

  private get wikidataUrl() {
    return `https://www.wikidata.org/entity/${this.entityId}`
  }

  private mounted() {
    this.getLabel(this.entityId).then((label: string) => {
      this.label = label
    })
  }
}
</script>
