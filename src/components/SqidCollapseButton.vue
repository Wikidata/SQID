<template>
  <div v-b-toggle="collapseId">
    <slot />
    <font-awesome-icon class="when-opened" icon="angle-down" />
    <font-awesome-icon class="when-closed" icon="angle-right" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ id: string }>()

const collapseId = computed(() => `collapse-${props.id}`)
</script>

<style scoped>
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
