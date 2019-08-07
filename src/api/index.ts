import { http } from '@/http'
import { ApiResult, SparqlResult } from './types'

export async function apiRequest(endpoint: string, query: any): Promise<ApiResult> {
  const response = await http.get(endpoint, {
    params: {
      format: 'json',
      origin: '*',
      ...query,
    },
  })

  return response.data
}

export async function sparqlRequest(endpoint: string, query: string): Promise<SparqlResult> {
  const response = await http.get(endpoint, {
    params: {
      format: 'json',
      query,
    },
  })

  return response.data
}
