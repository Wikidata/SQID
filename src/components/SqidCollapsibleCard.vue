<template>
  <b-card header-tag="header" no-body>
    <template v-slot:header>
      <sqid-collapse-button :id="id">
        <b>{{ header }}</b>
      </sqid-collapse-button>
    </template>
    <b-collapse :id="collapseId" visible>
      <slot />
    </b-collapse>
  </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
@Component
export default class SqidCollapsibleCard extends Vue {
  @Prop({ required: true }) private header!: string
  @Prop({ required: true }) private id!: string
  @Prop({ default: false, type: Boolean }) private narrow!: boolean

  private get collapseId() {
    return `collapse-${this.id}`
  }
}
</script>

<style lang="less" scoped>
.card {
  margin: 1.5em 0;
}
</style>
