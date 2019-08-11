<template>
  <span>
    <template v-if="valuetype === 'wikibase-entityid'">
      <entity-link :entityId="value.value.id" />
    </template>
    <template v-else-if="valuetype === 'string'">
      <template v-if="maybeLink">
        <a :href="maybeLink" target="_blank" :title="value.value">
          {{ maybeShortenedString }}
        </a>
      </template>
      <template v-else>
        {{ maybeShortenedString }}
      </template>
    </template>
    <template v-else-if="valuetype === 'time'">{{ timevalue(timedate) }}
      <i18n path="entity.calendar" v-if="calendar(timedate) !== 'Q1985727'">
        <entity-link place="calendar" :entityId="calendar(timedate)" />
      </i18n>
    </template>
    <template v-else-if="valuetype === 'quantity'">
      <i18n path="entity.quantityUnit" v-if="value.value.unit && value.value.unit !== '1'">
        <span place="amount">{{ amount }}</span>
        <span place="unit">
          <entity-link :entityId="unit" />
        </span>
      </i18n>
      <i18n path="entity.quantityNoUnit" v-else>
        <span place="amount">{{ amount }}</span>
      </i18n>
    </template>
    <template v-else-if="valuetype === 'globecoordinate'">{{ coordinate(globeCoordinate) }}
      <i18n path="entity.globe" v-if="globe(globeCoordinate) !== 'Q2'">
        <entity-link place="globe" :entityId="globe(globeCoordinate)" />
      </i18n>
    </template>
    <template v-else-if="valuetype === 'monolingualtext'">
      <i18n path="entity.monolingualText">
        <span place="text">{{ value.value.text }}</span>
        <small place="language">[{{ value.value.language }}]</small>
      </i18n>
    </template>
    <template v-else>{{ value }}</template>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { Action, Getter, namespace } from 'vuex-class'
import { EntityId, Datavalue, StringDataValue, TimeDataValue,
         GlobeCoordinateValue, QuantityDataValue } from '@/api/types'
import { dateFromTimeData, coordinateFromGlobeCoordinate } from '@/api/wikidata'
import { entityValue } from '@/api/sparql'

const properties = namespace('statistics/properties')

@Component
export default class DataValue extends Vue {
  @Prop({ required: true }) private value!: Datavalue
  @Prop({ required: true }) private propertyId!: EntityId
  @Prop({ default: false, type: Boolean }) private short!: boolean
  @Action private getPropertyDatatypes!: any
  @properties.Action private getUrlPattern!: (entityId: EntityId) => Promise<string>
  @Getter private getPropertyDatatype!: (entityId: EntityId) => string

  private datatype: string | null = null
  private urlPattern: string | null = null

  private created() {
    this.onUpdate()
  }

  @Watch('value')
  private async onUpdate() {
    this.datatype = null
    this.urlPattern = null

    if (this.valuetype === 'string') {
      const datatypes = await this.getPropertyDatatypes([this.propertyId])

      if (datatypes && this.propertyId in datatypes) {
        this.datatype = datatypes[this.propertyId]
      }

      const pattern = await this.getUrlPattern(this.propertyId)

      if (pattern) {
        this.urlPattern = pattern
      }
    }
  }

  private get valuetype() {
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

  private get maybeShortenedString() {
    let display = (this.value as StringDataValue).value

    if (this.short && display.length > 15) {
      display = `${display.slice(0, 6)}…${display.slice(display.length - 6)}`
    }

    return display
  }

  private get maybeLink() {
    const value = (this.value as StringDataValue).value

    switch (this.datatype) {
      case 'url':
        return value
      case 'commonsMedia':
        const filename = value.replace(/ /g, '_')
        return `https://commons.wikimedia.org/wiki/File:${filename}`
      default:
        if (this.urlPattern) {
          return this.urlPattern.replace('$1', value)
        }
    }

    return
  }

  private get amount() {
    const value = (this.value as QuantityDataValue).value
    const amount = value.amount

    if (amount.startsWith('+')) {
      return amount.slice(1)
    }

    return amount
  }

  private get unit() {
    const value = (this.value as QuantityDataValue).value
    const unit = value.unit || '1'

    if (unit !== '1') {
      return entityValue({ value: unit, type: 'uri' })
    }

    return unit
  }
}
</script>
