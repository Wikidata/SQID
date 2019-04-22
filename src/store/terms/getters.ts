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

  return fallbackTermsMap(terms).has(entityId)
}

export const getters: GetterTree<TermsState, RootState> = {
  getEntityLabel: (state) => (entityId: string, lang?: string, fallback = true) => {
    return getTerm(state.labels, entityId, lang, fallback)
  },

  hasEntityLabel: (state) => (entityId: string, lang?: string, fallback = true) => {
    return hasTerm(state.labels, entityId, lang, fallback)
  },
}
