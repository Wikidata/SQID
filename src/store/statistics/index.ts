import { Module } from 'vuex'
import { StatisticsState } from './types'
import { RootState } from '../types'
import { actions } from './actions'
import { getters } from './getters'
import { mutations } from './mutations'
import { properties } from './properties'

export const state: StatisticsState = {
  dumpDate: new Date(0),
  classesDate: new Date(0),
  refreshedDate: new Date(0),
  propertiesDate: new Date(0),
}

export const statistics: Module<StatisticsState, RootState> = {
  namespaced: true,
  modules: {
    properties,
  },
  state,
  actions,
  getters,
  mutations,
}
