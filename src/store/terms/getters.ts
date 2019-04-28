import { GetterTree } from 'vuex'
import { TermsState } from './types'
import { RootState } from '../types'

import { i18n } from '@/i18n'

type TermsMap = Map<string, string>
type Terms = Map<string, TermsMap>

function termsMap(terms: Terms,
                  lang?: string): TermsMap {
  const langCode = lang || i18n.locale
  const langTerms = terms.get(langCode)

  if (langTerms !== undefined) {
    return langTerms
  }

  return fallbackTermsMap(terms)
}

function fallbackTermsMap(terms: Terms): TermsMap {
  return terms.get(i18n.fallbackLocale)!
}

function getTerm(terms: Terms, entityId: string, lang?: string, fallback = true) {
  const nativeTerms = termsMap(terms, lang)
  const nativeTerm = nativeTerms.get(entityId)

  if (!fallback || nativeTerm !== undefined) {
    return nativeTerm
  }

  return fallbackTermsMap(terms).get(entityId)
}

function hasTerm(terms: Terms, entityId: string, lang?: string, fallback = true) {
  const nativeTerms = termsMap(terms, lang)
  const fallbackTerms = fallbackTermsMap(terms)

  if (nativeTerms !== undefined) {
    const hasNativeTerm = nativeTerms.has(entityId)

    if (!fallback) {
      return hasNativeTerm
    }
  } else if (!fallback) {
    return false
  }

  return fallbackTerms.has(entityId)
}

export const getters: GetterTree<TermsState, RootState> = {
  getEntityLabel: (state) => (entityId: string, lang?: string, fallback = true) => {
    return getTerm(state.labels, entityId, lang, fallback)
  },
  getAlias: (state) => (entityId: string, lang?: string, fallback = true) => {
    return getTerm(state.aliases, entityId, lang, fallback)
  },
  getDescription: (state) => (entityId: string, lang?: string, fallback = true) => {
    return getTerm(state.descriptions, entityId, lang, fallback)
  },
  getTerms: (state) => (entityId: string, lang?: string, fallback = true) => {
    const label = getTerm(state.labels, entityId, lang, fallback)
    const aliases = getTerm(state.aliases, entityId, lang, fallback) || []
    const description = getTerm(state.descriptions, entityId, lang, fallback)

    return {
      label,
      aliases,
      description,
    }
  },
  hasEntityLabel: (state) => (entityId: string, lang?: string, fallback = true) => {
    return hasTerm(state.labels, entityId, lang, fallback)
  },
  hasAlias: (state) => (entityId: string, lang?: string, fallback = true) => {
    return hasTerm(state.aliases, entityId, lang, fallback)
  },
  hasDescription: (state) => (entityId: string, lang?: string, fallback = true) => {
    return hasTerm(state.descriptions, entityId, lang, fallback)
  },
  hasTerms: (state) => (entityId: string, lang?: string, fallback = true) => {
    return (hasTerm(state.labels, entityId, lang, fallback) &&
            hasTerm(state.aliases, entityId, lang, fallback) &&
            hasTerm(state.descriptions, entityId, lang, fallback))
  },
}
