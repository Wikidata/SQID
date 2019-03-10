import { http } from '@/http'
import { ApiResult } from './types'

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
