import { http } from '@/http'
import { Claim, EntityId, SqidStatistics } from './types'
import { ClaimsMap } from '@/store/entity/claims/types'
import { PropertyClassification } from '@/store/statistics/properties/types'

const MAX_STATISTICS_AGE = 60 * 60 * 1000
const SCRIPT_RUNTIME_SLACK = 5 * 60 * 1000
const endpoint = 'https://tools-static.wmflabs.org/sqid/data'

function getDataFileURI(name: string, timestamp: number): string {
  return `${endpoint}/${name}.json?ts=${timestamp}`
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

export async function getPropertyClassification(lastRefresh: number): Promise<Map<EntityId, PropertyClassification>> {
  const response = await http.get(getDataFileURI('properties/classification', lastRefresh))
  const classification = new Map<EntityId, PropertyClassification>()

  for (const [entityId, kind] of Object.entries(response.data)) {
    classification.set(`P${entityId}`, kind as PropertyClassification)
  }

  return classification
}

type PropertyClassifier = (entityId: EntityId) => PropertyClassification

export function groupClaims(claims: ClaimsMap,
                            propertyGroups: PropertyClassifier):
Map<PropertyClassification, ClaimsMap> {
  const groupedClaims = new Map<PropertyClassification, ClaimsMap>()

  for (const [prop, claim] of claims.entries()) {
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
