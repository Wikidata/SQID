import { http } from '@/http'
import type { ApiQuery, ApiResult, SparqlResult } from './types'

export async function apiRequest<T extends ApiQuery>(
  endpoint: string,
  query: T,
): Promise<ApiResult> {
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
