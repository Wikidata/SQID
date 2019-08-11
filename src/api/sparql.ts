import { sparqlRequest } from './index'
import { sparqlEndpoint, MAX_SIMULTANEOUS_SPARQL_REQUESTS } from './endpoints'
import { EntityId, Rank, SparqlValue, SparqlBinding, SqidStatement } from './types'
import { TaskQueue } from 'cwait'

export const MAX_RELATED_BATCH = 101

export const RANK_PREFIX = 'http://wikiba.se/ontology#'
export const ENTITY_PREFIX = 'http://www.wikidata.org/entity/'
export const STATEMENT_PREFIX = 'http://www.wikidata.org/entity/statement/'
export const RANK_PREFIX_LEN = RANK_PREFIX.length
export const ENTITY_PREFIX_LEN = ENTITY_PREFIX.length
export const STATEMENT_PREFIX_LEN = STATEMENT_PREFIX.length

function statementsFromBindings(bindings: SparqlBinding[]) {
  return bindings.map((binding) => {
    // replace first '-' by '$' to obtain claim GUID
    return {
      item: entityValue(binding.it),
      statement: statementValue(binding.s).replace('-', '$'),
      property: entityValue(binding.p),
      rank: rankValue(binding.r),
    }
  })
}

function rankValue(binding: SparqlValue): Rank {
  const rank = binding.value.slice(RANK_PREFIX_LEN)

  switch (rank) {
    case 'NormalRank':
      return 'normal'
    case 'DeprecatedRank':
      return 'deprecated'
    case 'PreferredRank':
      return 'preferred'
  }

  throw new TypeError(`unknown rank value ${rank}`)
}

export function entityValue(binding: SparqlValue) {
  return binding.value.slice(ENTITY_PREFIX_LEN)
}

function statementValue(binding: SparqlValue) {
  return binding.value.slice(STATEMENT_PREFIX_LEN)
}

export async function sparqlQuery(query: string): Promise<SparqlBinding[]> {
  const response = await sparqlRequest(sparqlEndpoint,
                                     `#TOOL:SQID, https://tools.wmflabs.org/sqid/
${query}`)
  return response.results.bindings
}

export async function sparqlQueries(queries: string[]): Promise<SparqlBinding[][]> {
  const queue = new TaskQueue(Promise, MAX_SIMULTANEOUS_SPARQL_REQUESTS)
  const query = queue.wrap(sparqlQuery)

  return Promise.all(queries.map(query))
}

export async function getRelatedStatements(entityId: EntityId): Promise<SqidStatement[]> {
  const statements = await getRelatingStatements(entityId, MAX_RELATED_BATCH)

  if (statements.length < MAX_RELATED_BATCH) {
    // got all related statements
    return statements
  } else {
    // there might be more, fetch each property individually
    const properties = await getRelatingProperties(entityId)
    const results = await sparqlQueries(properties.map((propertyId) => {
      return relatingStatementsForPropertyQuery(entityId, propertyId, MAX_RELATED_BATCH)
    }))

    return results.flatMap(statementsFromBindings)
  }
}

async function getRelatingStatements(entityId: EntityId, limit: number):
Promise<SqidStatement[]> {
  const result = await sparqlQuery(`SELECT DISTINCT ?it ?s ?p ?r WHERE {
  ?p wikibase:statementProperty ?ps ;
  wikibase:claim ?pc .
  ?s ?ps wd:${entityId} ;
    wikibase:rank ?r .
  ?it ?pc ?s .
  FILTER( ?p != <http://www.wikidata.org/entity/P31> )
} LIMIT ${limit}`)

  return statementsFromBindings(result)
}

function relatingStatementsForPropertyQuery(entityId: EntityId,
                                            propertyId: EntityId,
                                            limit: number): string {
return `SELECT DISTINCT ?it ?s ?p ?r WHERE {
BIND(wd:${propertyId} AS ?p) .
?s ps:${propertyId} wd:${entityId} ;
  wikibase:rank ?r .
?it p:${propertyId} ?s .
} LIMIT ${limit}`
}

async function getRelatingProperties(entityId: EntityId): Promise<EntityId[]> {
  const result = await sparqlQuery(`SELECT DISTINCT ?p {
  ?s ?ps wd:${entityId} .
  ?p wikibase:statementProperty ?ps .
  FILTER( ?p != <http://www.wikidata.org/entity/P31> )
}`)

  return result.map((binding) => {
    return entityValue(binding.p)
  })
}

function propertySubjectsQuery(propertyId: EntityId,
                               lang: string,
                               object?: EntityId,
                               limit?: number,
                               resultVariable = 'p'): string {
  const obj = (object
               ? `wd:${object}`
               : '[]')
  const limitClause = limit ? ` LIMIT ${limit} ` : ''

  return `SELECT ?${resultVariable} ?${resultVariable}Label WHERE {{
  SELECT DISTINCT ?${resultVariable} WHERE {
    ?${resultVariable} wdt:${propertyId} ${obj} .
  }${limitClause}}
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang}" }
}`
}

export async function getPropertySubjects(propertyId: EntityId, lang: string, limit: number, entityId?: EntityId) {
  const result = await sparqlQuery(propertySubjectsQuery(propertyId, lang, entityId, limit))

  return result.map((binding) => {
    return { entityId: entityValue(binding.p),
             label: binding.pLabel.value,
           }
  })
}

function propertyObjectsQuery(propertyId: EntityId,
                              lang: string,
                              subject?: EntityId,
                              limit?: number,
                              resultVariable = 'p'): string {
  const subj = (subject
                ? `wd:${subject}`
                : '[]')
  const limitClause = limit ? ` LIMIT ${limit} ` : ''

  return `SELECT ?${resultVariable} ?${resultVariable}Label WHERE {{
  SELECT DISTINCT ?${resultVariable} WHERE {
    ${subj} wdt:${propertyId} ?${resultVariable} .
  }${limitClause}}
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang}" }
}`
}

export async function getPropertyObjects(propertyId: EntityId, lang: string, limit: number, entityId?: EntityId) {
  const result = await sparqlQuery(propertyObjectsQuery(propertyId, lang, entityId, limit))

  return result.map((binding) => {
    return { entityId: entityValue(binding.p),
             label: binding.pLabel.value,
           }
  })
}
