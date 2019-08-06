import { Module } from 'vuex'
import { mutations } from './mutations'
import { getters } from './getters'
import { ItemsState } from './types'
import { RootState } from '@/store/types'

export const state: ItemsState = {
  count: 0,
  countStatements: 0,
  countLabels: 0,
  countDescriptions: 0,
  countAliases: 0,
}

export const items: Module<ItemsState, RootState> = {
  namespaced: true,
  state,
  getters,
  mutations,
}
