import { EntityReference, EntityId, EntityKind, EntityResult, SearchResult,
         ResultList, TermResult, WBApiResult } from './types'
import { apiRequest } from './index'
import { wikidataEndpoint } from './endpoints'
import { i18n } from '@/i18n'

export { EntityId, EntityKind } from './types'

type Props = 'info' | 'sitelinks' | 'sitelinks/urls' | 'aliases' | 'labels' | 'descriptions' | 'claims' | 'datatype'

// todo(mx): implement proper request chunking for multiple ids
export async function getEntities(entityIds: string[],
                                  props: Props[],
                                  lang?: string,
                                  fallback = true): Promise<ResultList<EntityResult>> {
  const langCode = lang || i18n.locale
  const response = await apiRequest(wikidataEndpoint, {
    action: 'wbgetentities',
    ids: entityIds.join('|'),
    props: props.join('|'),
    languages: langCode,
    languagefallback: fallback,
  }) as WBApiResult

  return response.entities!
}

export async function getLabels(entityIds: string[], lang?: string, fallback = true) {
  const entities = await getEntities(entityIds, ['labels'], lang, fallback)
  const langCode = lang || i18n.locale
  const labels = new Map<string, Map<string, string>>()
  const nativeLabels = new Map<string, string>()
  labels.set(langCode, nativeLabels)

  for (const [entityId, entity] of Object.entries(entities)) {
    const label = entity.labels![langCode]
    nativeLabels.set(entityId, label.value)

    if (label.language !== langCode) {
      // label in fallback language, save also to original language
      if (!labels.has(label.language)) {
        labels.set(label.language, new Map<string, string>())
      }

      labels.get(label.language)!.set(entityId, label.value)
    }
  }

  return labels
}

function parseAliases(entityId: string, data: ResultList<TermResult>, lang?: string) {
  const langCode = lang || i18n.locale
  const aliases = new Map<string, Map<string, string[]>>()
  const nativeAliases = new Map<string, string[]>()
  aliases.set(langCode, nativeAliases)

  if (!(langCode in data)) {
    return aliases
  }

  const theAliases = []
  for (const entry of Object.entries(data[langCode])) {
    const alias = entry[1]

    theAliases.push(alias.value)

    if (alias.language !== langCode) {
      // alias in fallback language, save also to original language

      if (!aliases.has(alias.language)) {
        aliases.set(alias.language, new Map<string, string[]>())
      }

      const fallbackAliases = aliases.get(alias.language)!
      const otherAliases = fallbackAliases.get(entityId) || []
      otherAliases.push(alias.value)

      fallbackAliases.set(entityId, otherAliases)
    }
  }

  nativeAliases.set(entityId, theAliases)

  return aliases
}

function parseTerms(entityId: string, data: ResultList<TermResult>, lang?: string) {
  const langCode = lang || i18n.locale
  const terms = new Map<string, Map<string, string>>()
  const nativeTerms = new Map<string, string>()
  terms.set(langCode, nativeTerms)

  if (!(langCode in data)) {
    return terms
  }

  const term = data[langCode]
  nativeTerms.set(entityId, term.value)

  if (term.language !== langCode) {
    if (!terms.has(term.language)) {
      terms.set(term.language, new Map<string, string>())
    }

    terms.get(term.language)!.set(entityId, term.value)
  }

  return terms
}

export async function getEntityData(entityId: string, lang?: string, fallback = true) {
  const entities = await getEntities([entityId],
                                     ['aliases', 'labels', 'descriptions', 'claims', 'datatype'],
                                     lang,
                                     fallback)
  const entity = entities[entityId]
  const labels = parseTerms(entityId, entity.labels!)
  const aliases = parseAliases(entityId, entity.aliases!)
  const descriptions = parseTerms(entityId, entity.descriptions!)
  const claims = entities[entityId].claims!

  return {
    labels,
    aliases,
    descriptions,
    claims,
  }
}

export function parseEntityId(entityId: string): EntityReference {
  const prefix = entityId.slice(0, 1).toUpperCase()
  const id = parseInt(entityId.slice(1), 10)

  let kind = '' as EntityKind

  switch (prefix) {
    case 'P':
      kind = 'property'
      break
    case 'Q':
      kind = 'item'
      break

    default:
      throw new RangeError(`Unknown prefix ${prefix} in entityId`)
  }

  return {
    id,
    kind,
  }
}

export async function searchEntities(search: string,
                                     options: {
                                       lang?: string
                                       kind?: EntityKind,
                                       limit?: number,
                                       offset?: number,
                                       fallback?: boolean,
                                     }): Promise<ResultList<SearchResult>> {
  const langCode = options.lang || i18n.locale
  const params = {
    action: 'wbsearchentities',
    search,
    language: langCode,
  } as any

  if (options.kind !== 'item') {
    params.type = options.kind
  }

  if (options.limit !== 7) {
    params.limit = options.limit
  }

  if (options.offset !== undefined) {
    params.continue = options.offset
  }

  if (options.fallback !== undefined && !options.fallback) {
    params.strictlanguage = true
  }

  const response = await apiRequest(wikidataEndpoint, params) as WBApiResult

  return response.search!
}
