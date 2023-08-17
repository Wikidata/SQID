import { computed, ref } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'

import type { EntityId } from '@/api/types'
import { useStatisticsStore } from './statistics'
import {
  getPropertyClassification,
  getUrlPatterns,
  getPropertyUsage as getPropertyUsageData,
  shouldRefresh,
  getChunkId,
  RELATED_PROPERTIES_CHUNK_SIZE,
  getRelatedPropertiesChunk,
} from '@/api/sqid'
import { parseEntityId } from '@/api/wikidata'

export enum PropertyClassification {
  Ids = 'i',
  Family = 'f',
  Media = 'm',
  Wiki = 'w',
  Other = 'o',
  Hierarchy = 'h',
}

export type UsageInQualifier = Map<EntityId, number>

export interface PropertyStatistics {
  items: number
  statements: number
  inQualifiers: number
  inReferences: number
  qualifiers: UsageInQualifier
  classes: Array<EntityId>
}

function mustRefresh(lastRefresh: number) {
  const now = new Date().getTime()

  return shouldRefresh(now - lastRefresh)
}

type Store = ReturnType<typeof useStatisticsPropertiesStore>

export const useStatisticsPropertiesStore = defineStore('statistics-properties', () => {
  const propertyGroups = ref<Map<EntityId, PropertyClassification>>(new Map())
  const propertiesByGroup = ref<Map<PropertyClassification, Array<EntityId>>>(new Map())
  const classificationRefreshed = ref(new Date(0))
  const relatedPropertiesRefreshed = ref(new Date(0))
  const urlPatternsRefreshed = ref(new Date(0))
  const usageRefreshed = ref(new Date(0))
  const cachedRelatedPropertiesRefresh = ref(0)

  const count = ref(0)
  const countLabels = ref(0)
  const countStatements = ref(0)
  const countDescriptions = ref(0)
  const countAliases = ref(0)

  const urlPatterns = ref<Map<EntityId, string>>(new Map())
  const usage = ref<Map<EntityId, PropertyStatistics>>(new Map())

  const urlPattern = computed(() => urlPatterns.value.get)
  const groupsForProperty = computed(() => propertyGroups.value.get)
  const propertiesForGroup = computed(() => propertiesByGroup.value.get)

  function $reset(this: Store) {
    this.$patch({
      propertyGroups: new Map(),
      propertiesByGroup: new Map(),
      classificationRefreshed: new Date(0),
      relatedPropertiesRefreshed: new Date(0),
      urlPatternsRefreshed: new Date(0),
      usageRefreshed: new Date(0),
      cachedRelatedPropertiesRefresh: 0,
      count: 0,
      countLabels: 0,
      countStatements: 0,
      countDescriptions: 0,
      countAliases: 0,
      urlPatterns: new Map(),
    })
  }

  async function refreshClassification(this: Store) {
    const lastRefresh = this.classificationRefreshed.getTime()

    if (!mustRefresh(lastRefresh)) {
      return
    }

    const statistics = useStatisticsStore()
    await statistics.refresh()

    const response = await getPropertyClassification(lastRefresh)
    const propertyGroups = new Map()
    const propertiesByGroup = new Map()

    for (const [entityId, kind] of response) {
      const group = propertiesByGroup.get(kind) ?? []
      group.push(entityId)
      propertiesByGroup.set(kind, group)
      propertyGroups.set(entityId, kind)
    }

    this.$patch({
      propertyGroups,
      propertiesByGroup,
      classificationRefreshed: new Date(),
    })
  }

  async function refreshRelatedProperties(this: Store, propertyIds: Array<EntityId>) {
    const lastRefresh = this.relatedPropertiesRefreshed.getTime()

    const chunkIds = new Set<number>()

    for (const propertyId of propertyIds) {
      const { kind } = parseEntityId(propertyId)

      if (kind === 'property') {
        chunkIds.add(getChunkId(propertyId, RELATED_PROPERTIES_CHUNK_SIZE))
      }
    }

    const requests = []
    const timestamp = lastRefresh // todo(mx): fix this?

    for (const chunkId of chunkIds) {
      requests.push(getRelatedPropertiesChunk(chunkId, timestamp))
    }

    const responses = await Promise.all(requests)

    const result = new Map()

    for (const response of responses) {
      for (const [entityId, related] of response.entries()) {
        result.set(entityId, related)
      }
    }

    // todo(mx): update timestamp

    return result
  }

  async function getUrlPattern(this: Store, propertyId: EntityId) {
    const lastRefresh = this.urlPatternsRefreshed.getTime()

    if (!mustRefresh(lastRefresh)) {
      return this.urlPattern(propertyId)
    }

    const statistics = useStatisticsStore()
    await statistics.refresh()

    const urlPatterns = await getUrlPatterns(lastRefresh)
    this.$patch({ urlPatterns, urlPatternsRefreshed: new Date() })
  }

  async function getPropertyUsage(this: Store, propertyId: EntityId) {
    const lastRefresh = this.usageRefreshed.getTime()

    if (!mustRefresh(lastRefresh)) {
      return this.urlPattern(propertyId)
    }

    const statistics = useStatisticsStore()
    await statistics.refresh()

    const usage = await getPropertyUsageData(lastRefresh)
    this.$patch({ usage, usageRefreshed: new Date() })
  }

  return {
    propertyGroups,
    propertiesByGroup,
    classificationRefreshed,
    relatedPropertiesRefreshed,
    urlPatternsRefreshed,
    usageRefreshed,
    cachedRelatedPropertiesRefresh,
    count,
    countLabels,
    countStatements,
    countDescriptions,
    countAliases,
    urlPatterns,
    usage,

    urlPattern,
    groupsForProperty,
    propertiesForGroup,

    $reset,
    refreshClassification,
    refreshRelatedProperties,

    getUrlPattern,
    getPropertyUsage,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStatisticsPropertiesStore, import.meta.hot))
}
