import { StoreOptions } from 'vuex'
import { RootState } from '../types'
import { terms } from './terms/index'
import { claims } from './claims/index'
import { actions } from './actions'

export const entity: StoreOptions<RootState> = {
  modules: {
    terms,
    claims,
  },
  actions,
}
