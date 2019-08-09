import { Claim } from '@/api/types'

export type EntityId = string
export type ClaimsMap = Map<EntityId, Claim[]>

export interface ClaimsState {
  claims: Map<EntityId, ClaimsMap>,
}
