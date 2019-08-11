import { GetterTree } from 'vuex'
import { EntityId, EntityState } from './types'
import { RootState } from '@/store/types'
import { shouldRefresh, wikifyLink } from '@/api/sqid'
import { i18n } from '@/i18n'

export const getters: GetterTree<EntityState, RootState> = {
  entityDataTimestamp: (state) => (entityId: EntityId) => {
    if (state.timestamps.has(entityId)) {
      return state.timestamps.get(entityId)!
    }

    return new Date(0)
  },
  hasFreshData: (_state, getters) => // tslint:disable-line:no-shadowed-variable
    (entityId: EntityId) => {
      return !shouldRefresh(getters.entityDataTimestamp(entityId))
    },
  hasSiteLink: (state) => (entityId: EntityId, wikiname: string) => {
    return state.sitelinks.has(entityId) && state.sitelinks.get(entityId)!.has(wikiname)
  },
  getSiteLink: (state) => (entityId: EntityId, wikiname: string) => {
    const sitelinks = state.sitelinks.get(entityId)

    if (sitelinks === undefined) {
      return
    }

    return sitelinks.get(wikiname)
  },
  getSiteLinkTitle: (_state, getters) => // tslint:disable-line:no-shadowed-variable
    (entityId: EntityId, wikiname: string) => {
      if (getters.hasSiteLink(entityId, wikiname)) {
        return getters.getSiteLink(entityId, wikiname).title
      }

      return
    },
  getWikipediaUrl: (_state, getters, _rootState, rootGetters) => // tslint:disable-line:no-shadowed-variable
    (entityId: EntityId) => {
      const wikiname = `${i18n.locale}wiki`
      const title = getters.getSiteLinkTitle(entityId, wikiname)
      const url = rootGetters['statistics/siteLinkUrl'](wikiname)

      if (!title || !url) {
        return null
      }

      return wikifyLink(url.replace('$1', title))
    },
  getPropertyDatatype: (state) => (entityId: EntityId) => {
    return state.datatypes[entityId]
  },
}
