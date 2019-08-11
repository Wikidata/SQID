import { ActionTree, Commit } from 'vuex'
import { RootState } from '../types'

import { i18n } from '@/i18n'
import { Claim, Datavalue, EntityId, SnakType, WBDatatype } from '@/api/types'
import { getEntityData, parseEntityId } from '@/api/wikidata'
import { getRelatedStatements } from '@/api/sparql'
import { getExampleInstances, getExampleSubclasses, getExampleItems, getExampleValues } from '@/api/sqid'

async function idsFromExamples(commit: Commit,
                               getExample: (entityId: EntityId, lang: string)
                               => Promise<Array<{ entityId: EntityId,
                                                  label: string,
                                                }>>,
                               entityId: EntityId): Promise<EntityId[]> {
    const lang = i18n.locale
    const result = await getExample(entityId, lang)
    const labels = new Map<string, Map<EntityId, string>>()
    const langLabels = new Map<EntityId, string>()

    for (const { entityId: id, label } of result) {
      langLabels.set(id, label)
    }

    labels.set(lang, langLabels)
    commit('labelsLoaded', labels)

    return result.map((entity) => entity.entityId)
}

export const actions: ActionTree<RootState, RootState> = {
  async getEntityData({ commit, getters }, entityId: EntityId) {
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
    commit('sitelinksLoaded', {
      entityId,
      sitelinks: entityData.sitelinks,
    })

    const datatype = entityData.datatype

    if (datatype) {
      commit('datatypeLoaded', {
        entityId,
        datatype,
      })
    }

    return { ...getters.getTerms(entityId, lang),
             claims: getters.getClaims(entityId),
           }
  },
  async getReverseClaims({}, entityId: EntityId) {
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
  async getExampleInstances({ commit }, entityId: EntityId) {
    return idsFromExamples(commit, getExampleInstances, entityId)
  },
  async getExampleSubclasses({ commit }, entityId: EntityId) {
    return idsFromExamples(commit, getExampleSubclasses, entityId)
  },
  async getExampleItems({ commit }, entityId: EntityId) {
    return idsFromExamples(commit, getExampleItems, entityId)
  },
  async getExampleValues({ commit }, entityId: EntityId) {
    return idsFromExamples(commit, getExampleValues, entityId)
  },
}
