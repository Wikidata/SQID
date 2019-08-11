import { Module } from 'vuex'
import { RootState } from '../types'
import { terms } from './terms/index'
import { claims } from './claims/index'
import { actions } from './actions'
import { getters } from './getters'
import { mutations } from './mutations'
import { EntityId, EntityState, EntitySiteLink } from './types'

export const state: EntityState = {
  timestamps: new Map<EntityId, Date>(),
  sitelinks: new Map<EntityId, Map<string, EntitySiteLink>>(),
  datatypes: {},
}

export const entity: Module<EntityState, RootState> = {
  modules: {
    terms,
    claims,
  },
  state,
  actions,
  getters,
  mutations,
}
