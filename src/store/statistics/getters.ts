import { GetterTree } from 'vuex'
import { StatisticsState } from './types'
import { RootState } from '../types'

const MAX_STATISTICS_AGE = 60 * 60 * 1000
const SCRIPT_RUNTIME_SLACK = 5 * 60 * 1000

export const getters: GetterTree<StatisticsState, RootState> = {
  dumpTimestamp: (state) => {
    return state.dump.getTime()
  },
  classesTimestamp: (state) => {
    return state.classes.getTime()
  },
  propertiesTimestamp: (state) => {
    return state.properties.getTime()
  },
  lastRefresh: (state) => {
    return state.refreshed.getTime()
  },
  shouldCheckForUpdate: (_state, getters) => { // tslint:disable-line:no-shadowed-variable
    const now = new Date().getTime()
    const lastUpdate = Math.max(getters.dumpTimestamp,
                                getters.classesTimestamp,
                                getters.propertiesTimestamp)
    const timeSinceLastRefresh = now - getters.lastRefresh
    const timeSinceLastUpdate = now - lastUpdate

    if (timeSinceLastRefresh > MAX_STATISTICS_AGE) {
      return true
    }

    if (timeSinceLastUpdate > MAX_STATISTICS_AGE + SCRIPT_RUNTIME_SLACK) {
      return true
    }

    return false
  },
}
