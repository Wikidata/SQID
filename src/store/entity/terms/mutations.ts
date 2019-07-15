import { MutationTree } from 'vuex'
import { EntityId, LangCode, TermsState, MultilingualTermsMap, MultilingualInflightMap } from './types'
import { i18n } from '@/i18n'

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

function addInflight(currentInflight: MultilingualInflightMap,
                     entities: EntityId[],
                     lang: LangCode,
                     promise: Promise<string>) {
  const langCode = lang || i18n.locale
  let inflight = currentInflight.get(langCode)

  if (inflight === undefined) {
    inflight = new Map<EntityId, Promise<string>>()
  }

  for (const entityId of entities) {
    inflight.set(entityId, promise)
  }

  currentInflight.set(langCode, inflight)

  return currentInflight
}

function clearInflight(currentInflight: MultilingualInflightMap,
                       terms: MultilingualTermsMap) {
  for (const [langCode, theTerms] of terms) {
    const inflight = currentInflight.get(langCode)

    if (inflight !== undefined) {
      for (const entityId of theTerms.keys()) {
        inflight.delete(entityId)
      }

      currentInflight.set(langCode, inflight)
    }
  }

  return currentInflight
}

export const mutations: MutationTree<TermsState> = {
  labelsLoaded(state: TermsState, labels: MultilingualTermsMap) {
    state.labels = mergeTerms(state.labels, labels)
    state.inflightLabels = clearInflight(state.inflightLabels, labels)
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
    state.inflightTerms = clearInflight(state.inflightTerms, terms.labels)
  },
  termsRequested(state: TermsState, flight: {
    entities: EntityId[],
    lang: LangCode,
    promise: Promise<string>,
  }) {
    state.inflightTerms = addInflight(state.inflightTerms, flight.entities, flight.lang, flight.promise)
  },
  labelsRequested(state: TermsState, flight: {
    entities: EntityId[],
    lang: LangCode,
    promise: Promise<string>,
  }) {
    state.inflightLabels = addInflight(state.inflightLabels, flight.entities, flight.lang, flight.promise)
  },
}
