import { http } from '@/http'
import { EntityId, SqidStatistics } from './types'
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
