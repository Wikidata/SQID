<template>
  <span>
    <template v-if="datatype === 'wikibase-entityid'">
      <entity-link :entityId="value.value.id" />
    </template>
    <template v-else-if="datatype === 'string'">{{ value.value }}</template>
    <template v-else-if="datatype === 'time'">{{ timevalue(timedate) }}
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

  private timevalue(date: any) {
    if (!this.timestamp(date).toString().startsWith('Invalid')) {
      // valid date, use localised format
      return this.$d(this.timestamp(date), this.timeformat(date))
    }

    // date is out of range for javascript Date objects, format manually
    let result = date.year

    if (result.precision >= 10) {
      result += `-${date.month}`
    }

    if (result.precision >= 11) {
      result += `-${date.day}`
    }

    if (result.precision >= 12) {
      result += `T${date.hour}`
    }

    if (result.precision >= 13) {
      result += `:${date.minute}`
    }

    if (result.precision >= 14) {
      result += `:${date.second}`
    }

    if (result.precision >= 12) {
      result += `Z`
    }

    if (date.negative) {
      return this.$t('entity.dateBC', {date: result})
    }

    return result
  }

  private coordinate(coordinate: { coordinate: string }) {
    return coordinate.coordinate
  }

  private globe(coordinate: { globe: EntityId }) {
    return coordinate.globe
  }


}
</script>
