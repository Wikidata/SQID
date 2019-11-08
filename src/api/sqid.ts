import { http } from '@/http'
import { Claim, EntityId, ResultList, SqidStatistics,
         SqidHierarchyRecord, SqidPropertyUsageRecord,
         SqidRuleSchema } from './types'
import { ClaimsMap } from '@/store/entity/claims/types'
import { PropertyClassification, PropertyStatistics } from '@/store/statistics/properties/types'
import { ClassStatistics } from '@/store/statistics/classes/types'
import { getPropertySubjects, getPropertyObjects } from './sparql'
import { parseEntityId } from './wikidata'

export const RELATED_PROPERTIES_THRESHOLD = 5
export const MAX_EXAMPLE_INSTANCES = 20
export const MAX_DIRECT_SUBCLASSES = 10
export const MAX_EXAMPLE_SUBCLASSES = 10
export const MAX_EXAMPLE_ITEMS = 10
export const MAX_EXAMPLE_VALUSE = 20

const MAX_STATISTICS_AGE = 60 * 60 * 1000
const SCRIPT_RUNTIME_SLACK = 5 * 60 * 1000
const endpoint = 'https://tools-static.wmflabs.org/sqid/data'

function getDataFileURI(name: string, timestamp: number): string {
  return `${endpoint}/${name}.json?ts=${timestamp}`
}

function ifyNumericId(entityId: string, prefix: string): EntityId {
  return `${prefix}${entityId}`
}

function qifyNumericId(entityId: string) {
  return ifyNumericId(entityId, 'Q')
}

function pifyNumericId(entityId: string) {
  return ifyNumericId(entityId, 'P')
}

export function shouldRefresh(timeSinceLastRefresh: number,
                              timeSinceLastUpdate?: number) {
  if (timeSinceLastRefresh > MAX_STATISTICS_AGE) {
    return true
  }

  if ((timeSinceLastUpdate !== undefined) &&
      (timeSinceLastUpdate > MAX_STATISTICS_AGE + SCRIPT_RUNTIME_SLACK)) {
    return true
  }

  return false
}

export async function getStatistics(lastRefresh: number): Promise<SqidStatistics> {
  const response = await http.get(getDataFileURI('statistics', lastRefresh))
  const dumpDate = response.data.dumpDate
  const dumpYear = dumpDate.slice(0, 4)
  const dumpMonth = dumpDate.slice(4, 6)
  const dumpDay = dumpDate.slice(6, 8)
  response.data.dumpDate = `${dumpYear}-${dumpMonth}-${dumpDay}`

  return response.data
}

export async function getRuleSchema(lastRefresh: number): Promise<SqidRuleSchema> {
  const response = await http.get(getDataFileURI('rules.schema', lastRefresh))

  return response.data
}

export interface RelatednessMapping {
  [key: string]: RelatednessScores,
}

export interface RelatednessScores {
  [key: string]: number,
}

export function getChunkId(entityId: EntityId, chunkSize: number) {
  const { id } = parseEntityId(entityId)
  return Math.floor(id / chunkSize)
}

export async function getRelatedPropertiesChunk(chunkId: number, lastRefresh: number) {
  let response
  try {
    response = await http.get(getDataFileURI(`properties/related-${chunkId}`, lastRefresh))
  } catch {
    return {}
  }
  const chunk: RelatednessMapping = {}

  for (const [entityId, related] of Object.entries(response.data)) {
    const scores: RelatednessScores = {}

    for (const [relatedId, score] of Object.entries(related as RelatednessScores)) {
      scores[pifyNumericId(relatedId)] = score
    }

    chunk[pifyNumericId(entityId)] = scores
  }

  return Object.freeze(chunk)
}

export async function getRelatedProperties(lastRefresh: number): Promise<RelatednessMapping> {
  const response = await http.get(getDataFileURI('properties/related', lastRefresh))
  const scores: RelatednessMapping = {}

  for (const [entityId, related] of Object.entries(response.data)) {
    const relatedScores: RelatednessScores = {}

    for (const [relatedId, score] of Object.entries(related as RelatednessScores)) {
      relatedScores[`P${relatedId}`] = score
    }

    scores[`P${entityId}`] = relatedScores
  }

  return Object.freeze(scores)
}

export async function getPropertyClassification(lastRefresh: number): Promise<Map<EntityId, PropertyClassification>> {
  const response = await http.get(getDataFileURI('properties/classification', lastRefresh))
  const classification = new Map<EntityId, PropertyClassification>()

  for (const [entityId, kind] of Object.entries(response.data)) {
    classification.set(`P${entityId}`, kind as PropertyClassification)
  }

  return classification
}

export type PropertyClassifier = (entityId: EntityId) => PropertyClassification

export function groupClaims(claims: ClaimsMap,
                            propertyGroups: PropertyClassifier,
                            relatedScores: RelatednessMapping):
Map<PropertyClassification, ClaimsMap> {
  const groupedClaims = new Map<PropertyClassification, ClaimsMap>()
  const scores = new Map<EntityId, number>()
  const properties = []

  for (const propertyId of claims.keys()) {
    properties.push(propertyId)

    if (!(propertyId in relatedScores)) {
      scores.set(propertyId, 0)
    } else {
      for (const [relatedId, score] of Object.entries(relatedScores[propertyId])) {
        scores.set(relatedId, score + (scores.get(relatedId) || 0))
      }
    }
  }

  const sortedProperties = properties.sort((left, right) => {
    const lhs = scores.get(left) || 0
    const rhs = scores.get(right) || 0

    if (lhs < rhs) {
      return 1
    } else if (lhs > rhs) {
      return -1
    } else {
      return 0
    }
  })

  const sortedClaims = new Map<EntityId, Claim[]>()

  for (const propertyId of sortedProperties) {
    sortedClaims.set(propertyId, claims.get(propertyId)!)
  }

  for (const [prop, claim] of sortedClaims.entries()) {
    const kind = propertyGroups(prop)
    let group = groupedClaims.get(kind)

    if (group === undefined) {
      group = new Map<EntityId, Claim[]>()
    }

    group.set(prop, claim)
    groupedClaims.set(kind, group)
  }

  return groupedClaims
}

export function wikifyLink(uri: string | null): string | null {
  if (uri !== null) {
    return uri.replace(/ /g, '_')
  }

  return null
}

export async function getClassHierarchyChunk(chunkId: number, lastRefresh: number) {
  const chunk = new Map<EntityId, ClassStatistics>()
  let response
  try {
    response = await http.get(getDataFileURI(`classes/hierarchy-${chunkId}`, lastRefresh))
  } catch {
    return chunk
  }

  for (const [entityId, data] of Object.entries(response.data as { [key: string]: SqidHierarchyRecord })) {
    const superClasses = data.sc || []
    const nonemptySubClasses = data.sb || []
    const related: RelatednessScores = data.r || {}

    const sortedProperties = Object.entries(related)
      .filter((property) => property[1] > RELATED_PROPERTIES_THRESHOLD)
      .sort((left, right) => {
        if (left[1] < right[1]) {
          return 1
        } else if (left[1] > right[1]) {
          return -1
        }

        return 0
      })

    const relatedProperties = sortedProperties.map((property) => pifyNumericId(property[0]))

    const record = {
      directInstances: data.i || 0,
      directSubclasses: data.s || 0,
      allInstances: data.ai || 0,
      allSubclasses: data.as || 0,
      superClasses: superClasses.map(qifyNumericId),
      nonemptySubClasses: nonemptySubClasses.map(qifyNumericId),
      relatedProperties,
    }

    chunk.set(qifyNumericId(entityId), record)
  }

  return chunk
}

export async function getExampleInstances(entityId: EntityId, lang: string) {
  return getPropertySubjects('P31', lang, MAX_EXAMPLE_INSTANCES + 1, entityId)
}

export async function getExampleSubclasses(entityId: EntityId, lang: string) {
  return getPropertySubjects('P279', lang, MAX_EXAMPLE_SUBCLASSES + 1, entityId)
}

export async function getExampleItems(entityId: EntityId, lang: string) {
  return getPropertySubjects(entityId, lang, MAX_EXAMPLE_ITEMS + 1, undefined)
}

export async function getExampleValues(entityId: EntityId, lang: string) {
  return getPropertyObjects(entityId, lang, MAX_EXAMPLE_VALUSE + 1, undefined)
}

export async function getUrlPatterns(lastRefresh: number) {
  const patterns = new Map<EntityId, string>()
  const response = await http.get(getDataFileURI('properties/urlpatterns', lastRefresh))

  for (const [propertyId, pattern] of Object.entries(response.data)) {
    patterns.set(pifyNumericId(propertyId), pattern as string)
  }

  return patterns
}

export async function getPropertyUsage(lastRefresh: number) {
  const usage: { [key: string]: PropertyStatistics } = {}
  const response = await http.get(getDataFileURI('properties/usage', lastRefresh))

  for (const [propertyId, record] of Object.entries(response.data as
                                                    ResultList<SqidPropertyUsageRecord>)) {

    const classes = record.pc || []

    const usageRecord = {
      items: record.i || 0,
      statements: record.s || 0,
      inQualifiers: record.q || 0,
      inReferences: record.e || 0,
      classes: classes.map(qifyNumericId),
      qualifiers: new Map<EntityId, number>(),
    }

    if ('qs' in record) {
      const qualifiers = Object.entries(record.qs!).sort((left, right) => {
        if (left[1] < right[1]) {
          return 1
        } else if (left[1] > right[1]) {
          return -1
        }

        return 0
      })

      for (const [qualifier, count] of qualifiers) {
        usageRecord.qualifiers.set(pifyNumericId(qualifier), count)
      }
    }

    usage[pifyNumericId(propertyId)] = usageRecord
  }

  return usage
}
