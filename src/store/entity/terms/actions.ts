import { ActionTree } from 'vuex'
import { TermsState } from './types'
import { RootState } from '@/store/types'

import { i18n } from '@/i18n'
import { getLabels, getEntityData } from '@/api/wikidata'

export const actions: ActionTree<TermsState, RootState> = {
  async getLabel({ commit, getters }, entityId, lang?) {
    if (getters.hasEntityLabel(entityId, lang, false)) {
      return getters.getEntityLabel(entityId, lang)
    }

    if (getters.isLabelInflight(entityId, lang)) {
      return await getters.getLabelPromise(entityId, lang)
    }

    const promise = getLabels([entityId], lang)
    commit('labelsRequested', {
      entities: [entityId],
      lang,
      promise: promise.then((loadedTerms) => {
        const langCode = lang || i18n.locale
        const theTerms = loadedTerms.get(langCode)

        if (theTerms !== undefined) {
          const label = theTerms.get(entityId)

          if (label !== undefined) {
            return label
          }
        }

        return entityId
      }),
    })
    const labels = await promise
    commit('labelsLoaded', labels)

    return getters.getEntityLabel(entityId, lang)
  },
  async getTerms({ commit, getters }, entityId, lang?) {
    if (getters.hasTerms(entityId, lang, false)) {
      return getters.getTerms(entityId, lang)
    }

    if (getters.isTermsInflight(entityId, lang)) {
      return await getters.getTermsPromise(entityId, lang)
    }

    const promise = getEntityData(entityId, lang)
    commit('termsRequested', {
      entities: [entityId],
      lang,
      promise: promise.then((entityData) => {
        const langCode = lang || i18n

        let label = entityId
        let aliases: string[] = []
        let description = ''

        const loadedLabels = entityData.labels.get(langCode)
        if (loadedLabels !== undefined) {
          const theLabel = loadedLabels.get(entityId)

          if (theLabel !== undefined) {
            label = theLabel
          }
        }

        const loadedAliases = entityData.aliases.get(langCode)
        if (loadedAliases !== undefined) {
          const theAliases = loadedAliases.get(entityId)

          if (theAliases !== undefined) {
            aliases = theAliases
          }
        }

        const loadedDescriptions = entityData.descriptions.get(langCode)
        if (loadedDescriptions !== undefined) {
          const theDescription = loadedDescriptions.get(entityId)

          if (theDescription !== undefined) {
            description = theDescription
          }
        }

        return {
          label,
          aliases,
          description,
        }
      }),
    })
    const entityData = await promise
    commit('termsLoaded', {
      labels: entityData.labels,
      aliases: entityData.aliases,
      descriptions: entityData.descriptions,
    })

    return getters.getTerms(entityId, lang)
  },
}
