import { GetterTree } from 'vuex'
import { ClaimsState, EntityId } from './types'
import { RootState } from '@/store/types'
import { wikidataUrl } from '@/api/wikidata'
import { Claim } from '@/api/types'

function getStatementValue(claim: Claim) {
  if (claim.mainsnak.snaktype === 'value') {
    return (claim.mainsnak.datavalue as any).value
  }
}

function wikifyLink(uri: string | null): string | null {
  if (uri !== null) {
    return uri.replace(/ /g, '_')
  }

  return null
}

export const getters: GetterTree<ClaimsState, RootState> = {
  getClaims: (state) => (entityId: EntityId) => {
    return state.claims.get(entityId)
  },

  getClaimsForProperty: (state) => (entityId: EntityId, propertyId: EntityId) => {
    const claims = state.claims.get(entityId)

    if (claims === undefined) {
      return undefined
    }

    return claims.get(propertyId)
  },

  hasClaims: (state) => (entityId: EntityId) => {
    return state.claims.has(entityId)
  },

  getValuesForProperty: (_state, getters) => // tslint:disable-line:no-shadowed-variable
    (entityId: EntityId, propertyId: EntityId) => {
    const result = []
    const claims = getters.getClaimsForProperty(entityId, propertyId)

    if (claims !== undefined) {
      for (const claim of claims) {
        result.push(getStatementValue(claim))
      }
    }

    return result
    },
  getBestValueForProperty: (_state, getters) => // tslint:disable-line:no-shadowed-variable
    (entityId: EntityId, propertyId: EntityId) => {
      let result = null

      const claims = getters.getClaimsForProperty(entityId, propertyId)

      if (claims !== undefined) {
        for (const claim of claims) {
          if (claim.rank === 'preferred') {
            result = getStatementValue(claim)
            break
          } else if (result === null && claim.rank !== 'deprecated') {
            result = getStatementValue(claim)
          }
        }
      }

      return result
    },
  getImages: (_state, getters) => // tslint:disable-line:no-shadowed-variable
    (entityId: EntityId) => {
      const result = []
      const images = getters.getValuesForProperty(entityId, 'P18')

      if (images !== undefined) {
        for (const image of images) {
          result.push(wikifyLink(image))
        }
      }

      return result
    },
  getBanner: (_state, getters) => // tslint:disable-line:no-shadowed-variable
    (entityId: EntityId) => {
      return wikifyLink(getters.getBestValueForProperty(entityId, 'P948'))
    },
  getHomepage: (_state, getters) => // tslint:disable-line:no-shadowed-variable
    (entityId: EntityId) => {
      return getters.getBestValueForProperty(entityId, 'P856')
    },
  getWikidataUrl: (_state, _getters, _rootState, rootGetters) =>
    (entityId: EntityId) => {
      if (rootGetters.translationSetFromUri) {
        return wikidataUrl(entityId, rootGetters.currentTranslation)
      }

      return wikidataUrl(entityId)
    },
  getWikipediaUrl: (_state, _getters) => // tslint:disable-line:no-shadowed-variable
    (entityId: EntityId) => {
      return null               // todo(mx): implement this
    },
  getReasonatorUrl: (_state, _getters, _rootState, rootGetters) =>
    (entityId: EntityId) => {
      const forceLang = (rootGetters.translationSetFromUri
                         ? `&lang=${rootGetters.currentTranslation}`
                         : '')
      return `https://tools.wmflabs.org/?q=${entityId}${forceLang}`
    },
}
