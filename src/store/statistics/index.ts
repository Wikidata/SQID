import { Module } from 'vuex'
import { StatisticsState } from './types'
import { RootState } from '../types'
import { actions } from './actions'
import { getters } from './getters'
import { mutations } from './mutations'

export const state: StatisticsState = {
  dump: new Date(0),
  classes: new Date(0),
  refreshed: new Date(0),
  properties: new Date(0),
}

export const statistics: Module<StatisticsState, RootState> = {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
}
