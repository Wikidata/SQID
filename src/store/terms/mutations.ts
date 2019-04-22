import { MutationTree } from 'vuex'
import { TermsState } from './types'

export const mutations: MutationTree<TermsState> = {
  labelsLoaded(state: TermsState, labels: Map<string, Map<string, string>>) {
    for (const [langCode, labelsMap] of labels) {
      let theLabels = state.labels.get(langCode)

      if (theLabels === undefined) {
        theLabels = new Map<string, string>()
      }

      for (const [entityId, label] of labelsMap) {
        theLabels.set(entityId, label)
      }

      state.labels.set(langCode, theLabels)
    }
  },
}
