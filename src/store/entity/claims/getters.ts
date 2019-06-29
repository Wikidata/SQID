import { GetterTree } from 'vuex'
import { ClaimsState, EntityId } from './types'
import { RootState } from '@/store/types'

export const getters: GetterTree<ClaimsState, RootState> = {
  getClaims: (state) => (entityId: EntityId) => {
    return state.claims.get(entityId)
  },

  getClaimsForProperty: (state) => (entityId: EntityId, propertyId: EntityId) => {
    const claims = state.claims.get(entityId)

    if (claims === undefined) {
      return undefined
    }

    return claims.get(propertyId)
  },

  hasClaims: (state) => (entityId: EntityId) => {
    return state.claims.has(entityId)
  },
}
