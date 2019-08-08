<template>
  <div v-b-toggle="collapseId">
    <slot />
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

  svg {
    float: right;
    margin-left: 2px;
    color: grey;
  }
}

.collapsed > .when-opened,
:not(.collapsed) > .when-closed {
  display: none;
}

.badge {
  display: inline-block;
  line-height: 1;
  color: #666;
  background-color: #ccc;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  margin-top: 15px;

  table:not(.narrow) & {
    min-width: 10px;
    padding: 3px 7px;
    font-size: 90%;
    font-weight: 700;
    border-radius: 10px;
  }

  table.narrow & {
    min-width: 7px;
    padding: 2px 6px;
    font-size: 80%;
    font-weight: 600;
    border-radius: 7px;
  }
}
</style>
