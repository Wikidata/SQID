import { GetterTree } from 'vuex'
import { ClaimsState } from './types'
import { RootState } from '../types'

export const getters: GetterTree<ClaimsState, RootState> = {
  getClaims: (state) => (entityId: string) => {
    return state.claims.get(entityId)
  },

  hasClaims: (state) => (entityId: string) => {
    return state.claims.has(entityId)
  },
}
