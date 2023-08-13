<template>
  <span>
    <template v-if="value.type === 'wikibase-entityid'">
      <entity-link :entityId="entityId" />
    </template>
    <template v-else-if="value.type === 'string'">
      <template v-if="maybeLink">
        <a :href="maybeLink" target="_blank" :title="stringValue"> {{ shortenedStringValue }} </a>
      </template>
      <template v-else> {{ shortenedStringValue }} </template>
    </template>
    <template v-else-if="value.type === 'time'"
      >{{ formatTime(timeValue) }}
      <i18n-t keypath="entity.calendar" v-if="timeValue.calendar !== 'Q1985727'">
        <template #calendar>
          <entity-link :entityId="timeValue.calendar" />
        </template>
      </i18n-t>
    </template>
    <template v-else-if="value.type === 'quantity'">
      <i18n-t keypath="entity.quantityUnit" v-if="unit !== '1'">
        <template #amount>
          <span>{{ amount }}</span>
        </template>
        <template #unit>
          <span>
            <entity-link :entityId="unit" />
          </span>
        </template>
      </i18n-t>
      <i18n-t keypath="entity.quantityNoUnit" v-else>
        <template #amount>
          <span>{{ amount }}</span>
        </template>
      </i18n-t>
    </template>
    <template v-else-if="value.type === 'globecoordinate'"
      >{{ globeCoordinateValue.coordinate }}
      <i18n-t keypath="entity.globe" v-if="globeCoordinateValue.globe !== 'Q2'">
        <template #globe>
          <entity-link :entityId="globeCoordinateValue.globe" />
        </template>
      </i18n-t>
    </template>
    <template v-else-if="value.type === 'monolingualtext'">
      <i18n-t keypath="entity.monolingualText">
        <template #text
          ><span>{{ monolingualTextValue.text }}</span></template
        >
        <template #language
          ><small>[{{ monolingualTextValue.language }}]</small></template
        >
      </i18n-t>
    </template>
    <template v-else>{{ value }}</template>
  </span>
</template>

<script setup lang="ts">
import type {
  EntityId,
  Datavalue,
  StringDataValue,
  TimeDataValue,
  GlobeCoordinateValue,
  QuantityDataValue,
  EntityIdDataValue,
  MonolingualTextDataValue,
} from '@/api/types'
import { dateFromTimeData, coordinateFromGlobeCoordinate, type Timestamp } from '@/api/wikidata'
import { entityValue } from '@/api/sparql'
import { useI18n } from 'vue-i18n'
import { computed, ref, watchEffect } from 'vue'

const { t, d } = useI18n()

interface Props {
  value: Datavalue
  propertyId: EntityId
  short?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  short: false,
})

const datatype = ref<string | null>(null)
const urlPattern = ref<string | null>(null)

watchEffect(async () => {
  if (props.value.type === 'string') {
    const datatypes = new Map() // await getPropertyDatatypes([props.propertyId])
    datatype.value = datatypes?.get(props.propertyId)
    urlPattern.value = null // await getUrlPattern(props.popertyId)
  }
})

const entityId = computed(() => {
  const { value } = props.value as EntityIdDataValue
  return value.id
})

const timeValue = computed(() => dateFromTimeData(props.value as TimeDataValue))
const globeCoordinateValue = computed(() =>
  coordinateFromGlobeCoordinate(props.value as GlobeCoordinateValue),
)

function formatTime(date: Timestamp) {
  if (!date.time.toString().startsWith('Invalid')) {
    // valid date, use localised format
    return d(date.time, date.format)
  }

  // date is out of range for javascript Date objects, format manually
  let result = date.year

  if (date.precision >= 10) {
    result += `-${date.month}`
  }

  if (date.precision >= 11) {
    result += `-${date.day}`
  }

  if (date.precision >= 12) {
    result += `T${date.hour}`
  }

  if (date.precision >= 13) {
    result += `:${date.minute}`
  }

  if (date.precision >= 14) {
    result += `:${date.second}`
  }

  if (date.precision >= 12) {
    result += `Z`
  }

  if (date.negative) {
    return t('entity.dateBC', { date: result })
  }

  return result
}

const stringValue = computed(() => {
  const { value } = props.value as StringDataValue
  return value
})

const shortenedStringValue = computed(() => {
  const { value } = props.value as StringDataValue

  if (props.short && value.length > 15) {
    return `${value.slice(0, 6)}..${value.slice(value.length - 6)}`
  }

  return value
})

const maybeLink = computed(() => {
  const { value } = props.value as StringDataValue

  switch (datatype.value) {
    case 'url':
      return value
    case 'commonsMedia': {
      const filename = value.replace(/ /g, '_')
      return `https://commons.wikimedia.org/wiki/File:${filename}`
    }
    default:
      return urlPattern?.value?.replace('$1', value)
  }
})

const monolingualTextValue = computed(() => {
  const { value } = props.value as MonolingualTextDataValue
  return value
})

const amount = computed(() => {
  const { value } = props.value as QuantityDataValue
  const amount = value.amount

  if (amount.startsWith('+')) {
    return amount.slice(1)
  }

  return amount
})

const unit = computed(() => {
  const { value } = props.value as QuantityDataValue
  const unit = value.unit ?? '1'

  if (unit !== '1') {
    return entityValue({ value: unit, type: 'uri' })
  }

  return unit
})
</script>
