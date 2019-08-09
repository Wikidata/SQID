<template>
  <span>
    <template v-if="datatype === 'wikibase-entityid'">
      <entity-link :entityId="value.value.id" />
    </template>
    <template v-else-if="datatype === 'string'">{{ value.value }}</template>
    <template v-else-if="datatype === 'time'">{{ $d(timestamp(timedate), timeformat(timedate)) }}
      <i18n path="entity.calendar" v-if="calendar(timedate) !== 'Q1985727'">
        <entity-link place="calendar" :entityId="calendar(timedate)" />
      </i18n>
    </template>
    <template v-else-if="datatype === 'globecoordinate'">{{ coordinate(globeCoordinate) }}
      <i18n path="entity.globe" v-if="globe(globeCoordinate) !== 'Q2'">
        <entity-link place="globe" :entityId="globe(globeCoordinate)" />
      </i18n>
    </template>
    <template v-else-if="datatype === 'monolingualtext'">{{ value.value.text }} [{{ value.value.language }}]</template>
    <template v-else>{{ value }}</template>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { EntityId, Datavalue, TimeDataValue, GlobeCoordinateValue } from '@/api/types'
import { dateFromTimeData, coordinateFromGlobeCoordinate } from '@/api/wikidata'

@Component
export default class DataValue extends Vue {
  @Prop({ required: true }) private value!: Datavalue

  private get datatype() {
    return this.value.type
  }

  private get timedate() {
    return dateFromTimeData(this.value as TimeDataValue)
  }

  private get globeCoordinate() {
    return coordinateFromGlobeCoordinate(this.value as GlobeCoordinateValue)
  }

  private timestamp(date: { time: Date }) {
    return date.time
  }

  private timeformat(date: { format: string }) {
    return date.format
  }

  private calendar(date: { calendar: EntityId }) {
    return date.calendar
  }

  private coordinate(coordinate: { coordinate: string }) {
    return coordinate.coordinate
  }

  private globe(coordinate: { globe: EntityId }) {
    return coordinate.globe
  }


}
</script>
