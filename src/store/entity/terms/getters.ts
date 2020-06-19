import { GetterTree } from 'vuex'
import { TermsState } from './types'
import { RootState } from '@/store/types'

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
  const lang = i18n.fallbackLocale.toString()

  if (!terms.has(lang)) {
    terms.set(lang, new Map<string, string>())
  }

  return terms.get(lang)!
}

function getTerm(terms: Terms, entityId: string, lang?: string, fallback: boolean = true) {
  const nativeTerms = termsMap(terms, lang)
  const nativeTerm = nativeTerms.get(entityId)

  if (!fallback || nativeTerm !== undefined) {
    return nativeTerm
  }

  return fallbackTermsMap(terms).get(entityId)
}

function hasTerm(terms: Terms, entityId: string, lang?: string, fallback: boolean = true) {
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

function getPromise(inflight: any, entityId: string, lang?: string, fallback: boolean = true) {
  const langCode = lang || i18n.locale
  const nativeInflight = inflight.get(langCode)

  if (nativeInflight !== undefined) {
    if (nativeInflight.has(entityId)) {
      return nativeInflight.get(entityId)!
    }

    if (fallback) {
      const fallbackInflight = inflight.get(i18n.fallbackLocale)

      if (fallbackInflight !== undefined) {
        return fallbackInflight.get(entityId)
      }
    }
  }
}

function hasPromise(inflight: any, entityId: string, lang?: string, fallback: boolean = true) {
  const langCode = lang || i18n.locale
  const nativeInflight = inflight.get(langCode)

  if (nativeInflight !== undefined) {
    if (nativeInflight.has(entityId)) {
      return true
    }

    if (fallback) {
      const fallbackInflight = inflight.get(i18n.fallbackLocale)

      if (fallbackInflight !== undefined) {
        return fallbackInflight.has(entityId)
      }
    }
  }

  return false
}

export const getters: GetterTree<TermsState, RootState> = {
  getEntityLabel: (state) => (entityId: string, lang?: string, fallback: boolean = true) => {
    return getTerm(state.labels, entityId, lang, fallback)
  },
  getAlias: (state) => (entityId: string, lang?: string, fallback: boolean = true) => {
    return getTerm(state.aliases, entityId, lang, fallback)
  },
  getDescription: (state) => (entityId: string, lang?: string, fallback: boolean = true) => {
    return getTerm(state.descriptions, entityId, lang, fallback)
  },
  getTerms: (state) => (entityId: string, lang?: string, fallback: boolean = true) => {
    const label = getTerm(state.labels, entityId, lang, fallback)
    const aliases = getTerm(state.aliases, entityId, lang, fallback) || []
    const description = getTerm(state.descriptions, entityId, lang, fallback)

    return {
      label,
      aliases,
      description,
    }
  },
  hasEntityLabel: (state) => (entityId: string, lang?: string, fallback: boolean = true) => {
    return hasTerm(state.labels, entityId, lang, fallback)
  },
  hasAlias: (state) => (entityId: string, lang?: string, fallback: boolean = true) => {
    return hasTerm(state.aliases, entityId, lang, fallback)
  },
  hasDescription: (state) => (entityId: string, lang?: string, fallback: boolean = true) => {
    return hasTerm(state.descriptions, entityId, lang, fallback)
  },
  hasTerms: (state) => (entityId: string, lang?: string, fallback: boolean = true) => {
    return (hasTerm(state.labels, entityId, lang, fallback) &&
            hasTerm(state.aliases, entityId, lang, fallback) &&
            hasTerm(state.descriptions, entityId, lang, fallback))
  },
  isLabelInflight: (state) => (entityId: string, lang?: string, fallback: boolean = true) => {
    return hasPromise(state.inflightLabels, entityId, lang, fallback)
  },
  isTermsInflight: (state) => (entityId: string, lang?: string, fallback: boolean = true) => {
    return hasPromise(state.inflightTerms, entityId, lang, fallback)
  },
  getLabelPromise: (state) => (entityId: string, lang?: string, fallback: boolean = true) => {
    return getPromise(state.inflightLabels, entityId, lang, fallback)
  },
  getTermsPromise: (state) => (entityId: string, lang?: string, fallback: boolean = true) => {
    return getPromise(state.inflightTerms, entityId, lang, fallback)
  },
}
