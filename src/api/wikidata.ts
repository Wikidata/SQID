import { EntityReference, EntityId, EntityIdDataValue, EntityKind,
         EntityResult, SearchResult, ResultList, TermResult,
         Claim, WBApiResult, EntitySiteLink, TimeDataValue,
         GlobeCoordinateValue, QualifiedEntityValue,
         EntityMissingError, MalformedEntityIdError } from './types'
import { apiRequest } from './index'
import { wikidataEndpoint, MAX_SIMULTANEOUS_API_REQUESTS, MAX_ENTITIES_PER_API_REQUEST } from './endpoints'
import { ENTITY_PREFIX_LEN } from './sparql'
import { i18n } from '@/i18n'
import { ClaimsMap } from '@/store/entity/claims/types'
import { TaskQueue } from 'cwait'

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
    if (chunk !== undefined) {
      for (const [key, entity] of Object.entries(chunk)) {
        entities[key] = entity
      }
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
    const { kind } = parseEntityId(entityId)

    let label

    if (!('labels' in entity)) {
      label = { value: entityId, language: langCode }
    } else {
      label = entity.labels![langCode]
    }

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

export async function getEntityInfo(entityId: EntityId) {
  try {
    const _id = parseEntityId(entityId)
  } catch (err) {
    throw err
  }

  const entities = await getEntities([entityId], ['info']) || []

  if (!(entityId in entities) ||
      ('missing' in entities[entityId])) {
    throw new EntityMissingError(entityId)
  }
}

export async function getEntityData(entityId: EntityId, lang?: string, fallback = true) {
  const entities = await getEntities([entityId],
                                     ['aliases', 'labels', 'descriptions', 'info',
                                      'claims', 'datatype', 'sitelinks'],
                                     lang,
                                     fallback)

  if ('missing' in entities[entityId]) {
    throw new EntityMissingError(entityId)
  }

  const entity = entities[entityId]
  const labels = parseTerms(entityId, entity.labels!)
  const aliases = parseAliases(entityId, entity.aliases!)
  const descriptions = parseTerms(entityId, entity.descriptions!)
  const claims = new Map<string, Map<string, Claim>>()
  const links = entities[entityId].sitelinks || {}
  const sitelinks = new Map<string, EntitySiteLink>(Object.entries(links))
  const datatype = entity.datatype
  claims.set(entityId,
             new Map<string, Claim>(Object.entries(entities[entityId].claims!)))

  return {
    labels,
    aliases,
    descriptions,
    claims,
    sitelinks,
    datatype,
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

      if (isNaN(id)) {
        const [entity, sub] = entityId.slice(1).split('-')

        if (!entity || !sub) {
          throw new MalformedEntityIdError(entityId, `Ill-formed numeric part ${entityId.slice(1)}`)
        }

        const subPrefix = sub.slice(0, 1).toUpperCase()
        const subId = parseInt(sub.slice(1), 10)
        const mainId = parseInt(entity, 10)

        if (isNaN(mainId)) {
          throw new MalformedEntityIdError(entityId, `Ill-formed numeric part ${entity}`)
        }

        if (isNaN(subId)) {
          throw new MalformedEntityIdError(entityId, `Ill-formed numeric part ${sub.slice(1)}`)
        }

        switch (subPrefix) {
          case 'S':
            kind = 'sense'
            break
          case 'F':
            kind = 'form'
            break

          default:
            throw new MalformedEntityIdError(entityId, `Unknown subPrefix ${subPrefix}`)
        }
        return {
          id: mainId,
          kind,
          subId,
        }
      }

      break

    default:
      throw new MalformedEntityIdError(entityId, `Unknown prefix ${prefix}`)
  }

  if (isNaN(id)) {
    throw new MalformedEntityIdError(entityId, `Ill-formed numeric part ${entityId.slice(1)}`)
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

      if (mainsnak.snaktype === 'value' &&
          ['wikibase-item', 'wikibase-property', 'wikibase-lexeme'].includes(mainsnak.datatype)) {
        const datavalue = (mainsnak.datavalue as EntityIdDataValue)

        entityIds.add(datavalue.value.id)
      }

      if ('references' in claim) {
        for (const reference of claim.references) {
          for (const [propId, snaks] of Object.entries(reference.snaks)) {
            entityIds.add(propId)
            for (const snak of snaks) {
              if (snak.snaktype === 'value' &&
                  snak.datatype === 'wikibase-item') {
                const datavalue = (snak.datavalue as EntityIdDataValue)
                entityIds.add(datavalue.value.id)
              }
            }
          }
        }
      }

      if ('qualifiers' in claim) {
        for (const [propId, snaks] of Object.entries(claim.qualifiers!)) {
          entityIds.add(propId)

          for (const snak of snaks) {
            if (snak.snaktype === 'value' &&
                snak.datatype === 'wikibase-item') {
              const datavalue = (snak.datavalue as EntityIdDataValue)
              entityIds.add(datavalue.value.id)
            }
          }
        }
      }
    }
  }

  return entityIds
}

export function wikidataUrl(entityId: EntityId, lang?: string) {
  let forceLang = ''
  if (lang !== undefined) {
    forceLang = `?uselang=${lang}`
  }

  return `https://www.wikidata.org/entity/${entityId}${forceLang}`
}

function makeComponentValid(component: string) {
  if (component === '00') {
    return '01'
  }

  return component
}

export function dateFromTimeData(data: TimeDataValue) {
  let timestring = data.value.time
  const precision = data.value.precision
  const calendar = data.value.calendarmodel.slice(ENTITY_PREFIX_LEN)

  let negative = false

  if (timestring.startsWith('+')) {
    timestring = timestring.slice(1)
  } else if (timestring.startsWith('-')) {
    timestring = timestring.slice(1)
    negative = true
  }

  let TZ = 'Z'

  if (timestring.endsWith('Z')) {
    timestring = timestring.slice(0, timestring.length - 1)
  } else {
    [ timestring, TZ ] = timestring.split('+')
  }

  const [ date, time ] = timestring.split('T')
  let [ year, month, day ] = date.split('-')
  const [ hour, minute, second ] = time.split(':')

  if (['0000', '+0000', '-0000'].includes(year)) {
    year = '0001'
  }

  const prefix = negative ? '-00' : ''
  month = makeComponentValid(month)
  day = makeComponentValid(day)

  const result = new Date(`${prefix}${year}-${month}-${day}T${hour}:${minute}:${second}${TZ}`)

  return { time: result,
           format: `precision-${precision}`,
           calendar,
           year,
           month,
           day,
           hour,
           minute,
           second,
           negative,
         }
}

function extractCoordinateComponents(value: number) {
  const degrees = Math.floor(value)
  value -= degrees

  const minutes = Math.floor(value * 60)
  value *= 60
  value -= Math.floor(value)

  const seconds = Math.floor(value * 60)

  return { degrees,
           minutes,
           seconds,
         }
}

export function coordinateFromGlobeCoordinate(data: GlobeCoordinateValue) {
  const globe = data.value.globe.slice(ENTITY_PREFIX_LEN)
  const precision = data.value.precision.toExponential()
  const places = Number(precision.split('e-')[1])

  const latitude = data.value.latitude
  const lat = Math.abs(latitude).toFixed(places)
  const ns = (latitude >= 0) ? 'N' : 'S'
  const { degrees: lad, minutes: lam, seconds: las } = extractCoordinateComponents(Number(lat))

  const longitude = Number(data.value.longitude)
  const lon = Math.abs(longitude).toFixed(places)
  const we = (longitude >= 0) ? 'W' : 'E'
  const { degrees: lod, minutes: lom, seconds: los } = extractCoordinateComponents(Number(lon))

  const coordinate = `(${lad}°${lam}'${las}" ${ns}, ${lod}°${lom}'${los}" ${we})`
  return {
    coordinate,
    globe,
  }
}

export function idsFromQualifiedEntity(entity: QualifiedEntityValue): EntityId[] {
  const ids = [entity.value.id]

  for (const [propId, snaks] of entity.qualifiers) {
    ids.push(propId)

    for (const snak of snaks) {
      if (snak.snaktype === 'value' && snak.datavalue.type === 'wikibase-entityid') {
        ids.push((snak.datavalue as EntityIdDataValue).value.id)
      }
    }
  }

  return ids
}

export function isItemId(entityId: EntityId) {
  const { kind } = parseEntityId(entityId)

  return kind === 'item'
}

export function isPropertyId(entityId: EntityId) {
  const { kind } = parseEntityId(entityId)

  return kind === 'property'
}
