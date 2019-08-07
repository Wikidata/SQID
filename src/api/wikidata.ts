import { EntityReference, EntityId, EntityIdDataValue, EntityKind,
         EntityResult, SearchResult, ResultList, TermResult,
         Claim, WBApiResult, EntitySiteLink } from './types'
import { apiRequest } from './index'
import { wikidataEndpoint, MAX_SIMULTANEOUS_API_REQUESTS, MAX_ENTITIES_PER_API_REQUEST } from './endpoints'
import { i18n } from '@/i18n'
import { ClaimsMap } from '@/store/entity/claims/types'
import { TaskQueue } from 'cwait'

export { EntityId, EntityKind } from './types'

type Props = 'info' | 'sitelinks' | 'sitelinks/urls' | 'aliases' | 'labels' | 'descriptions' | 'claims' | 'datatype'

export async function getEntities(entityIds: string[],
                                  props: Props[],
                                  lang?: string,
                                  fallback = true): Promise<ResultList<EntityResult>> {
  const chunks = []
  const ids = entityIds.length

  for (let start = 0; start <= ids; start += MAX_ENTITIES_PER_API_REQUEST) {
    const end = start + MAX_ENTITIES_PER_API_REQUEST
    const chunk = entityIds.slice(start, end)

    if (chunk.length) {
      chunks.push(chunk)
    }
  }

  const queue = new TaskQueue(Promise, MAX_SIMULTANEOUS_API_REQUESTS)
  const getChunk = queue.wrap(getEntityChunk)

  const results = await Promise.all(chunks.map((chunk) => {
    return getChunk(chunk, props, lang, fallback)
  }))
  const entities: ResultList<EntityResult> = {}

  for (const chunk of results) {
    for (const [key, entity] of Object.entries(chunk)) {
      entities[key] = entity
    }
  }

  return entities
}

async function getEntityChunk(entityIds: string[],
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

    if (label !== undefined) {
      nativeLabels.set(entityId, label.value)

      if (label.language !== langCode) {
        // label in fallback language, save also to original language
        if (!labels.has(label.language)) {
          labels.set(label.language, new Map<string, string>())
        }

        labels.get(label.language)!.set(entityId, label.value)
      }
    } else {
      // no label in native or fallback language, use id
      nativeLabels.set(entityId, entityId)
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
                                     ['aliases', 'labels', 'descriptions', 'claims', 'datatype', 'sitelinks'],
                                     lang,
                                     fallback)
  const entity = entities[entityId]
  const labels = parseTerms(entityId, entity.labels!)
  const aliases = parseAliases(entityId, entity.aliases!)
  const descriptions = parseTerms(entityId, entity.descriptions!)
  const claims = new Map<string, Map<string, Claim>>()
  const links = entities[entityId].sitelinks || {}
  const sitelinks = new Map<string, EntitySiteLink>(Object.entries(links))
  claims.set(entityId,
             new Map<string, Claim>(Object.entries(entities[entityId].claims!)))

  return {
    labels,
    aliases,
    descriptions,
    claims,
    sitelinks,
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
    case 'L':
      kind = 'lexeme'
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

export async function siteLinkUrls(entityId: EntityId) {
  const entities = await getEntities([entityId], ['sitelinks/urls'])
  const urls: any = {}

  if (entities !== undefined) {
    const entity = entities[entityId]
    if (entity !== undefined) {
      for (const [site, sitelink] of Object.entries(entity.sitelinks!)) {
        urls[site] = sitelink.url!
      }
    }
  }

  return urls
}

export function relatedEntityIds(claims: ClaimsMap) {
  const entityIds = new Set()

  for (const [propertyId, theClaims] of claims) {
    entityIds.add(propertyId)

    for (const claim of theClaims) {
      const mainsnak = claim.mainsnak
      entityIds.add(mainsnak.property)

      if (mainsnak.datatype === 'wikibase-item') {
        const datavalue = (mainsnak.datavalue as EntityIdDataValue)
        entityIds.add(datavalue.value.id)
      }

      if ('references' in claim) {
        for (const reference of claim.references) {
          for (const [propId, snaks] of Object.entries(reference.snaks)) {
            entityIds.add(propId)
            for (const snak of snaks) {
              if (snak.datatype === 'wikibase-item') {
                const datavalue = (snak.datavalue as EntityIdDataValue)
                entityIds.add(datavalue.value.id)
              }
            }
          }
        }
      }
    }
  }

  return entityIds
}
