import { GetterTree } from 'vuex'
import { StatisticsState } from './types'
import { RootState } from '../types'
import { shouldRefresh } from '@/api/sqid'

export const getters: GetterTree<StatisticsState, RootState> = {
  dumpTimestamp: (state) => {
    return state.dumpDate.getTime()
  },
  classesTimestamp: (state) => {
    return state.classesDate.getTime()
  },
  propertiesTimestamp: (state) => {
    return state.propertiesDate.getTime()
  },
  lastRefresh: (state) => {
    return state.refreshedDate.getTime()
  },
  siteLinkCount: (state) => {
    return state.sitelinks
  },
  siteLinkUrl: (state) => (wikiname: string) => {
    const sitelink = state.sites.get(wikiname)

    if (sitelink === undefined) {
      return null
    }

    return sitelink.u
  },
  shouldCheckForUpdate: (_state, getters) => { // tslint:disable-line:no-shadowed-variable
    const now = new Date().getTime()
    const lastUpdate = Math.max(getters.dumpTimestamp,
                                getters.classesTimestamp,
                                getters.propertiesTimestamp)
    const timeSinceLastRefresh = now - getters.lastRefresh
    const timeSinceLastUpdate = now - lastUpdate

    return shouldRefresh(timeSinceLastRefresh, timeSinceLastUpdate)
  },
}
