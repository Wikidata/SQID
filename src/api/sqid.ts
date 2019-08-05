import { http } from '@/http'
import { SqidStatistics } from './types'

const endpoint = 'https://tools-static.wmflabs.org/sqid/data'

function getDataFileURI(name: string, timestamp: number): string {
  return `${endpoint}/${name}.json?ts=${timestamp}`
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
