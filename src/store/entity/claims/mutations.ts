import { MutationTree } from 'vuex'
import { ClaimsState, ClaimsMap, EntityId } from './types'
import { Claim } from '@/api/types'

export const mutations: MutationTree<ClaimsState> = {
  claimsLoaded(state: ClaimsState,
               claims: Map<EntityId, ClaimsMap>) {
    for (const [entityId, claimsMap] of claims) {
      let theClaims = state.claims.get(entityId)

      if (theClaims === undefined) {
        theClaims = new Map<EntityId, Claim[]>()
      }

      for (const [propertyId, claim] of claimsMap) {
        theClaims.set(propertyId, claim)
      }

      state.claims.set(entityId, theClaims)
    }
  },
}
