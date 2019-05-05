import { MutationTree } from 'vuex'
import { TermsState, MultilingualTermsMap } from './types'

function mergeTerms(currentTerms: MultilingualTermsMap,
                    loadedTerms: MultilingualTermsMap) {
  for (const [langCode, termsMap] of loadedTerms) {
    let theTerms = currentTerms.get(langCode)

    if (theTerms === undefined) {
      theTerms = new Map<string, string>()
    }

    for (const [entityId, term] of termsMap) {
      theTerms.set(entityId, term)
    }

    currentTerms.set(langCode, theTerms)
  }

  return currentTerms
}

export const mutations: MutationTree<TermsState> = {
  labelsLoaded(state: TermsState, labels: MultilingualTermsMap) {
    state.labels = mergeTerms(state.labels, labels)
  },
  aliasesLoaded(state: TermsState, aliases: MultilingualTermsMap) {
    state.aliases = mergeTerms(state.aliases, aliases)
  },
  descriptionsLoaded(state: TermsState, descriptions: MultilingualTermsMap) {
    state.descriptions = mergeTerms(state.descriptions, descriptions)
  },
  termsLoaded(state: TermsState, terms: {
    labels: MultilingualTermsMap,
    aliases: MultilingualTermsMap,
    descriptions: MultilingualTermsMap,
  }) {
    state.labels = mergeTerms(state.labels, terms.labels)
    state.aliases = mergeTerms(state.aliases, terms.aliases)
    state.descriptions = mergeTerms(state.descriptions, terms.descriptions)
  },
}
