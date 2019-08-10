import { GetterTree } from 'vuex'
import { ClaimsState, EntityId } from './types'
import { RootState } from '@/store/types'
import { wikidataUrl } from '@/api/wikidata'
import { Claim, Snak } from '@/api/types'
import { wikifyLink } from '@/api/sqid'

function getStatementValue(claim: Claim) {
  if (claim.mainsnak.snaktype === 'value') {
    return (claim.mainsnak.datavalue as any).value
  }
}

function getStatementQualifiers(claim: Claim) {
  const qualifiers = new Map<EntityId, Snak[]>()

  if (!claim.qualifiers) {
    return qualifiers
  }

  const order = claim['qualifiers-order'] || Object.keys(claim.qualifiers)

  for (const propId of order) {
    qualifiers.set(propId, claim.qualifiers[propId])
  }

  return qualifiers
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
        result.push({ value: getStatementValue(claim),
                      qualifiers: getStatementQualifiers(claim),
                      id: claim.id,
                    })
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
        for (const { value: image } of images) {
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
  getReasonatorUrl: (_state, _getters, _rootState, rootGetters) =>
    (entityId: EntityId) => {
      const forceLang = (rootGetters.translationSetFromUri
                         ? `&lang=${rootGetters.currentTranslation}`
                         : '')
      return `https://tools.wmflabs.org/reasonator/?q=${entityId}${forceLang}`
    },
}
