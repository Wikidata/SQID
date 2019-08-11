import { MutationTree } from 'vuex'
import { EntityId, EntityState, EntitySiteLink, WBDatatype } from './types'

export const mutations: MutationTree<EntityState> = {
  updateTimestamp(state, entityId: EntityId) {
    state.timestamps.set(entityId, new Date())
  },
  sitelinksLoaded(state,
                  { entityId, sitelinks }: { entityId: EntityId,
                                             sitelinks: Map<string, EntitySiteLink>,
                                           }) {
    state.sitelinks.set(entityId, sitelinks)
  },
  datatypeLoaded(state,
                 { entityId, datatype }: { entityId: EntityId,
                                           datatype: WBDatatype,
                                         }) {
    Object.defineProperty(state.datatypes, entityId, { value: datatype,
                                                       configurable: false })
  },
  datatypesLoaded(state, datatypes: { [key: string]: WBDatatype }) {
    for (const [propertyId, datatype] of Object.entries(datatypes)) {
      Object.defineProperty(state.datatypes, propertyId, { value: datatype,
                                                            configurable: false })
    }
  },

}
