<template>
  <span>
    <template v-if="datatype === 'wikibase-entityid'">
      <entity-link :entityId="value.value.id" />
    </template>
    <template v-else-if="datatype === 'string'">{{ value.value }}</template>
    <template v-else-if="datatype === 'time'"> {{ timestamp }}</template>
    <template v-else>{{ value }}</template>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Datavalue, TimeDataValue } from '@/api/types'

@Component
export default class DataValue extends Vue {
  @Prop() private value!: Datavalue

  private get datatype() {
    return this.value.type
  }

  private get timestamp() {
    return (this.value as TimeDataValue).value.time // todo(mx): implement this
  }
}
</script>
