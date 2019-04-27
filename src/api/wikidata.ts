import { EntityReference, EntityId, EntityKind, EntityResult, SearchResult, ResultList, WBApiResult } from './types'
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
