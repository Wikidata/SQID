<template>
  <div v-b-toggle="collapseId">
    <b><slot /></b>
    <font-awesome-icon class="when-opened" icon="angle-down" />
    <font-awesome-icon class="when-closed" icon="angle-right" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class SqidCollapseButton extends Vue {
  @Prop({ required: true }) private id!: string

  private get collapseId() {
    return `collapse-${this.id}`
  }
}
</script>

<style lang="less" scoped>
div {
  cursor: pointer;
}
div > svg {
  float: right;
  color: grey;
}

.collapsed > .when-opened,
:not(.collapsed) > .when-closed {
  display: none;
}
</style>
