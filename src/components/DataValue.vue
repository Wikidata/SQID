<template>
  <span>
    <template v-if="datatype === 'wikibase-entityid'">
      <entity-link :entityId="value.value.id" />
    </template>
    <template v-else-if="datatype === 'string'">{{ value.value }}</template>
    <template v-else-if="datatype === 'time'">{{ $d(timestamp, timeformat) }}
      <i18n path="entity.calendar" v-if="calendar !== 'Q1985727'">
        <entity-link place="calendar" :entityId="calendar" />
      </i18n>
    </template>
    <template v-else>{{ value }}</template>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Datavalue, TimeDataValue } from '@/api/types'
import { dateFromTimeData } from '@/api/wikidata'

@Component
export default class DataValue extends Vue {
  @Prop({ required: true }) private value!: Datavalue

  private get datatype() {
    return this.value.type
  }

  private get date() {
    return dateFromTimeData(this.value as TimeDataValue)
  }

  private get timestamp() {
    return this.date.time
  }

  private get timeformat() {
    return this.date.format
  }

  private get calendar() {
    return this.date.calendar
  }
}
</script>
