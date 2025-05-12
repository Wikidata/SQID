import { computed, ref } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'

import type { EntityId } from '@/api/types'
import i18n from '@/i18n'
import {
  getLabels,
  type EntityDataPromise,
  type LabelsPromise,
  getEntityData,
} from '@/api/wikidata'

export type LangCode = string
export type TermsMap = Map<EntityId, string>
export type ManyTermsMap = Map<EntityId, string[]>
export type Terms = Map<string, TermsMap>
export type ManyTerms = Map<string, ManyTermsMap>
export type MultilingualTermsMap = Map<LangCode, TermsMap>
export type MultilingualManyTermsMap = Map<LangCode, ManyTermsMap>
type InflightMap<T> = Map<LangCode, Map<EntityId, T>>
export type InflightLabelsMap = InflightMap<LabelsPromise>
export type InflightTermsMap = InflightMap<EntityDataPromise>

type Store = ReturnType<typeof useEntitiesTermsStore>

interface LangOptions {
  lang?: string
}

export interface LabelOptions extends LangOptions {
  entityId: EntityId
}

export interface LabelsOptions extends LangOptions {
  entityIds: EntityId[]
}

type TermOrTerms = string | string[]
type TermOrTermsMap<T = TermOrTerms> = Map<LangCode, Map<EntityId, T>>

function termsMap<T = TermOrTerms>(terms: TermOrTermsMap<T>, lang?: string): Map<EntityId, T> {
  const langCode = lang ?? i18n.global.locale.value

  return terms.get(langCode) ?? fallbackTermsMap(terms)
}

function fallbackTermsMap<T = TermOrTerms>(terms: TermOrTermsMap<T>): Map<EntityId, T> {
  const lang = i18n.global.fallbackLocale.value.toString()

  if (!terms.has(lang)) {
    terms.set(lang, new Map())
  }

  return terms.get(lang)!
}

function getTerm<T = TermOrTerms>(
  terms: TermOrTermsMap<T>,
  entityId: EntityId,
  lang?: LangCode,
  fallback: boolean = true,
): T | undefined {
  const nativeTerms = termsMap(terms, lang)
  const nativeTerm = nativeTerms.get(entityId)

  if (!fallback || nativeTerm !== undefined) {
    return nativeTerm
  }

  return fallbackTermsMap(terms).get(entityId)
}

function hasTerm<T = TermOrTerms>(
  terms: TermOrTermsMap<T>,
  entityId: EntityId,
  lang?: LangCode,
  fallback: boolean = true,
) {
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

function getPromise<T>(
  inflight: InflightMap<T>,
  entityId: EntityId,
  lang?: LangCode,
  fallback: boolean = true,
) {
  const langCode = lang ?? i18n.global.locale.value
  const nativeInflight = inflight.get(langCode)

  if (nativeInflight !== undefined) {
    if (nativeInflight.has(entityId)) {
      return nativeInflight.get(entityId)!
    }
  }

  if (fallback) {
    const fallbackInflight = inflight.get(i18n.global.fallbackLocale.value.toString())

    if (fallbackInflight !== undefined) {
      return fallbackInflight.get(entityId)
    }
  }
}

function hasPromise<T>(
  inflight: InflightMap<T>,
  entityId: EntityId,
  lang?: LangCode,
  fallback: boolean = true,
) {
  const langCode = lang ?? i18n.global.locale.value
  const nativeInflight = inflight.get(langCode)

  if (nativeInflight?.has(entityId)) {
    return true
  }

  if (fallback) {
    const fallbackInflight = inflight.get(i18n.global.fallbackLocale.value.toString())

    return fallbackInflight?.has(entityId)
  }
}

function mergeTerms<T = TermOrTerms>(
  currentTerms: TermOrTermsMap<T>,
  loadedTerms: TermOrTermsMap<T>,
) {
  for (const [langCode, termsMap] of loadedTerms) {
    const terms = currentTerms.get(langCode) ?? new Map()

    for (const [entityId, term] of termsMap) {
      terms.set(entityId, term)
    }

    currentTerms.set(langCode, terms)
  }

  return currentTerms
}

function addInflight<T>(
  currentInflight: InflightMap<T>,
  entities: EntityId[],
  promise: T,
  lang?: LangCode,
) {
  const langCode = lang ?? i18n.global.locale.value
  const inflight = currentInflight.get(langCode) ?? new Map()

  for (const entityId of entities) {
    inflight.set(entityId, promise)
  }

  currentInflight.set(langCode, inflight)

  return currentInflight
}

function clearInflight<T>(currentInflight: InflightMap<T>, terms: MultilingualTermsMap) {
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

export const useEntitiesTermsStore = defineStore('entities-terms', () => {
  const labels = ref<MultilingualTermsMap>(new Map())
  const aliases = ref<MultilingualManyTermsMap>(new Map())
  const descriptions = ref<MultilingualTermsMap>(new Map())

  const inflightTerms = ref<InflightTermsMap>(new Map())
  const inflightLabels = ref<InflightLabelsMap>(new Map())

  function $reset(this: Store) {
    this.$patch({
      labels: new Map(),
      aliases: new Map(),
      descriptions: new Map(),
      inflightTerms: new Map(),
      inflightLabels: new Map(),
    })
  }

  const entityLabel = computed(
    () =>
      (entityId: EntityId, lang?: LangCode, fallback = true) =>
        getTerm(labels.value, entityId, lang, fallback),
  )

  const entityAliases = computed(
    () =>
      (entityId: EntityId, lang?: LangCode, fallback = true) =>
        getTerm(aliases.value, entityId, lang, fallback),
  )

  const entityDescription = computed(
    () =>
      (entityId: EntityId, lang?: LangCode, fallback = true) =>
        getTerm(descriptions.value, entityId, lang, fallback),
  )

  const entityTerms = computed(() => (entityId: EntityId, lang?: LangCode, fallback = true) => {
    return {
      label: getTerm(labels.value, entityId, lang, fallback),
      aliases: getTerm(aliases.value, entityId, lang, fallback),
      description: getTerm(descriptions.value, entityId, lang, fallback),
    }
  })

  const hasEntityLabel = computed(
    () =>
      (entityId: EntityId, lang?: LangCode, fallback = true) =>
        hasTerm(labels.value, entityId, lang, fallback),
  )

  const hasAliases = computed(
    () =>
      (entityId: EntityId, lang?: LangCode, fallback = true) =>
        hasTerm(aliases.value, entityId, lang, fallback),
  )

  const hasDescription = computed(
    () =>
      (entityId: EntityId, lang?: LangCode, fallback = true) =>
        hasTerm(descriptions.value, entityId, lang, fallback),
  )

  const hasTerms = computed(
    () =>
      (entityId: EntityId, lang?: LangCode, fallback = true) =>
        hasTerm(labels.value, entityId, lang, fallback) &&
        hasTerm(aliases.value, entityId, lang, fallback) &&
        hasTerm(descriptions.value, entityId, lang, fallback),
  )

  const isLabelInflight = computed(
    () =>
      (entityId: EntityId, lang?: LangCode, fallback = true) =>
        hasPromise(inflightLabels.value, entityId, lang, fallback),
  )

  const isTermsInflight = computed(
    () =>
      (entityId: EntityId, lang?: LangCode, fallback = true) =>
        hasPromise(inflightTerms.value, entityId, lang, fallback),
  )

  function addLabels(this: Store, labels: MultilingualTermsMap) {
    this.$patch({
      labels: mergeTerms(this.labels, labels),
      inflightLabels: clearInflight(this.inflightLabels, labels),
    })
  }

  function addAliases(this: Store, aliases: MultilingualManyTermsMap) {
    this.aliases = mergeTerms(this.aliases, aliases)
  }

  function addDescriptions(newDescriptions: MultilingualTermsMap) {
    descriptions.value = mergeTerms(descriptions.value, newDescriptions)
  }

  function addTerms(
    this: Store,
    terms: {
      labels: MultilingualTermsMap
      aliases: MultilingualManyTermsMap
      descriptions: MultilingualTermsMap
    },
  ) {
    this.$patch({
      labels: mergeTerms(this.labels, terms.labels),
      aliases: mergeTerms(this.aliases, terms.aliases),
      descriptions: mergeTerms(this.descriptions, terms.descriptions),
      inflightTerms: clearInflight(this.inflightTerms, terms.labels),
    })
  }

  async function getLabel(this: Store, { entityId, lang }: LabelOptions) {
    if (this.hasEntityLabel(entityId, lang, false)) {
      return this.entityLabel(entityId, lang)!
    }

    if (this.isLabelInflight(entityId, lang)) {
      const loadedTerms = await getPromise(this.inflightLabels, entityId, lang, true)
      const langCode = lang ?? i18n.global.locale.value
      const theTerms = loadedTerms?.get(langCode)

      return theTerms?.get(entityId) ?? entityId
    }

    const promise = getLabels([entityId], lang)
    this.inflightLabels = addInflight(this.inflightLabels, [entityId], promise, lang)

    const labels = await promise
    this.addLabels(labels)

    return this.entityLabel(entityId, lang) ?? entityId
  }

  async function requestLabels(this: Store, { entityIds, lang }: LabelsOptions) {
    const missingLabels = []

    for (const entityId of entityIds) {
      if (!this.hasEntityLabel(entityId, lang, false) && !this.isLabelInflight(entityId, lang)) {
        missingLabels.push(entityId)
      }
    }

    if (missingLabels.length === 0) {
      return
    }

    const promise = getLabels(missingLabels, lang)
    this.inflightLabels = addInflight(this.inflightLabels, missingLabels, promise, lang)
  }

  async function getTerms(this: Store, { entityId, lang }: LabelOptions) {
    if (this.hasTerms(entityId, lang, false)) {
      return this.entityTerms(entityId, lang)
    }

    if (this.isTermsInflight(entityId, lang)) {
      const promise = getPromise(this.inflightTerms, entityId, lang)
      const terms = await promise
      const langCode = lang ?? i18n.global.locale.value

      return {
        label: terms?.labels.get(langCode)?.get(entityId) ?? entityId,
        aliases: terms?.aliases.get(langCode)?.get(entityId) ?? [],
        description: terms?.descriptions.get(langCode)?.get(entityId),
      }
    }

    const promise = getEntityData(entityId, lang)
    this.inflightTerms = addInflight(this.inflightTerms, [entityId], promise, lang)
    const terms = await promise

    if (terms === undefined) {
      return
    }

    this.inflightTerms = clearInflight(this.inflightTerms, terms.labels)

    this.$patch({
      labels: mergeTerms(this.labels, terms.labels),
      aliases: mergeTerms(this.aliases, terms.aliases),
      descriptions: mergeTerms(this.descriptions, terms.descriptions),
    })

    return this.entityTerms(entityId, lang)
  }

  return {
    labels,
    aliases,
    descriptions,
    inflightTerms,
    inflightLabels,

    $reset,

    entityLabel,
    entityAliases,
    entityDescription,
    entityTerms,

    hasEntityLabel,
    hasAliases,
    hasDescription,
    hasTerms,

    isLabelInflight,
    isTermsInflight,

    addLabels,
    addAliases,
    addDescriptions,
    addTerms,

    getLabel,
    requestLabels,
    getTerms,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEntitiesTermsStore, import.meta.hot))
}
