import { ActionTree } from 'vuex'
import { RootState } from '../types'

import { i18n } from '@/i18n'
import { Claim, Datavalue, EntityId, SnakType, WBDatatype } from '@/api/types'
import { getEntityData, parseEntityId } from '@/api/wikidata'
import { getRelatedStatements } from '@/api/sparql'

export const actions: ActionTree<RootState, RootState> = {
  async getEntityData({ commit, getters }, entityId) {
    const lang = i18n.locale

    if (getters.hasTerms(entityId, lang) &&
        getters.hasClaims(entityId)) {
      return { ...getters.getTerms(entityId, lang),
               claims: getters.getClaims(entityId),
             }
    }

    const langCode = lang || i18n.locale
    const entityData = await getEntityData(entityId, langCode)

    commit('claimsLoaded', entityData.claims)
    commit('termsLoaded', {
      labels: entityData.labels,
      aliases: entityData.aliases,
      descriptions: entityData.descriptions,
    })

    return { ...getters.getTerms(entityId, lang),
             claims: getters.getClaims(entityId),
           }
  },
  async getReverseClaims({}, entityId) {
    const statements = await getRelatedStatements(entityId)
    const claims = new Map<EntityId, Claim[]>()

    for (const statement of statements) {
      const item = statement.item
      const { kind } = parseEntityId(item)

      const property = statement.property
      let propertyClaims = claims.get(property)

      if (propertyClaims === undefined) {
        propertyClaims = []
      }

      const datavalue = {
        type: 'wikibase-entityid',
        value: {
          'entity-type': kind,
          'id': item,
        },
      } as Datavalue

      const mainsnak = {
        snaktype: 'value' as SnakType,
        property: statement.property,
        hash: '',
        datavalue,
        datatype: `wikibase-${kind}` as WBDatatype,
      }

      propertyClaims.push({
        mainsnak,
        type: 'statement',
        id: statement.statement,
        rank: statement.rank,
        references: [],
      })

      claims.set(property, propertyClaims)
    }

    return claims
  },
}
