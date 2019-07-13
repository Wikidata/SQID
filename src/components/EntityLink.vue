<template>
  <router-link :to="destination" :title="tooltip">{{ label }}</router-link>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { Action } from 'vuex-class'
import { EntityId } from '@/store/entity/claims/types'

@Component
export default class EntityLink extends Vue {
  @Prop() private entityId!: EntityId
  @Action private getLabel: any
  private label: string = this.entityId

  private get destination() {
    return { name: 'entity',
             params: { id: this.entityId },
           }
  }

  private get tooltip() {
    return `${this.label} (${this.entityId})`
  }

  private updateLabel() {
    this.getLabel(this.entityId).then((label: string) => {
        this.label = label
      })
  }

  private mounted() {
    this.updateLabel()
  }

  @Watch('entityId')
  private onEntityIdChanged() {
    this.updateLabel()
  }
}
</script>
