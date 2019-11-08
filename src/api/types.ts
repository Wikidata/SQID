export interface ApiResult {
  batchcomplete?: string
  success?: number
}

export interface MWApiResult extends ApiResult {
  query?: QueryResult
}

export interface WBApiResult extends ApiResult {
  entities?: ResultList<EntityResult>
  searchinfo?: SearchInfo
  search?: ResultList<SearchResult>
}

export interface ResultList<T> {
  [key: string]: T
}

export interface QueryResult {
  pages: ResultList<PageResult>
}

export interface SparqlList<T> {
  [key: number]: T
}

export interface SparqlValue {
  type: 'uri',
  value: string,
}

export interface SparqlBinding {
  [key: string]: SparqlValue,
}

export interface SparqlResults {
  bindings: SparqlBinding[],
}

export type SparqlHead = SparqlList<string>

export interface SparqlResult {
  head: SparqlHead,
  results: SparqlResults,
}

export type PageResult = ImagePageResult

export interface ImagePageResult {
  ns: number
  title: string
  missing: string
  known: string
  imagerepository: string
  imageinfo?: ImageInfo[]
}

export interface ImageInfo {
  size: number
  width: number
  height: number
  thumburl: string
  thumbwidth: number
  thumbheight: number
  url: string
  descriptionurl: string
  descriptionshorturl: string
}

export interface EntityResult {
  type: EntityKind,
  id: EntityId,
  datatype?: WBDatatype,
  labels?: ResultList<TermResult>,
  descriptions?: ResultList<TermResult>,
  aliases?: ResultList<TermResult>,
  claims?: ResultList<Claim>,
  sitelinks?: ResultList<EntitySiteLink>,
}

export interface TermResult {
  language: string
  value: string
}

export type ClaimType = 'statement'
export type Rank = 'normal' | 'preferred' | 'deprecated'

export interface Claim {
  mainsnak: Snak
  type: ClaimType
  id: string
  rank: Rank
  qualifiers?: ResultList<Snak[]>
  'qualifiers-order'?: EntityId[]
  references: Reference[]
}

export type SnakType = 'value'
export type WBDatatype = 'wikibase-item' | 'wikibase-property' |
  'wikibase-lexeme' | 'wikibase-form' | 'wikibase-sense' |
  'globe-coordinate' | 'time' | 'monolingualtext' | 'quantity' | 'commonsMedia'

export interface Snak {
  snaktype: SnakType
  property: EntityId
  hash: string
  datavalue: Datavalue
  datatype: WBDatatype
}

export type DatavalueKind = 'wikibase-entityid' | 'time' | 'globecoordinate' | 'string' | 'monolingualtext' | 'quantity'

export interface Datavalue {
  type: DatavalueKind
}

export interface EntityIdDataValue extends Datavalue {
  type: 'wikibase-entityid'
  value: EntityIdValue
}

export interface EntityIdValue {
  'entity-type': EntityKind
  'numeric-id'?: number
  id: string
}

export interface StringDataValue extends Datavalue {
  type: 'string'
  value: string
}

export interface TimeDataValue extends Datavalue {
  type: 'time'
  value: TimeValue
}

export interface TimeValue {
  time: string,
  precision: number,
  calendarmodel: string,
}

export interface GlobeCoordinateValue extends Datavalue {
  type: 'globecoordinate',
  value: GlobeCoordinate,
}

export interface GlobeCoordinate {
  latitude: number,
  longitude: number,
  precision: number,
  globe: string,
  altitude?: null,
}

export interface QuantityDataValue extends Datavalue {
  type: 'quantity',
  value: QuantityValue,
}

export interface QuantityValue {
  amount: string,
  unit?: '1' | EntityId,
}

export interface Reference {
  hash: string
  snaks: ResultList<Snak[]>
  'snaks-order': string[]
}

export interface SearchInfo {
  search: string
}

export type MatchType = 'alias' | 'label'

export interface MatchInfo {
  type: MatchType
  language: string
  text: string
}

export interface SearchResult {
  reposity: string
  id: string
  concepturi: string
  title: string
  pageid: number
  url: string
  label: string
  description: string
  match: MatchInfo
  aliases: string[]
}

export type EntityKind = 'item' | 'property' | 'lexeme' | 'form' | 'sense'
export type EntityId = string
export type StatementId = string
export interface EntityReference {
  id: number,
  kind: EntityKind,
  subId?: number,
}

export type SqidRuleSchema = object

export interface SqidEntityStatistics {
  c: number,
  cLabels: number,
  cStmts: number,
  cDesc: number,
  cAliases: number,
}

export interface SqidHierarchyRecord {
  i?: number,
  s?: number,
  ai?: number,
  as?: number,
  sc?: EntityId[],
  sb?: EntityId[],
  r?: ResultList<number>,
}

export interface SqidPropertyUsageRecord {
  i?: number,
  s?: number,
  q?: number,
  e?: number,
  qs?: ResultList<number>,
  pc?: EntityId[],
}

export interface SqidStatistics {
  dumpDate: string,
  classUpdate: string,
  propertyUpdate: string,
  propertyStatistics: SqidEntityStatistics,
  itemStatistics: SqidEntityStatistics,
  siteLinkCount: number,
  sites: ResultList<SqidSiteLink>,
}

export interface EntitySiteLink {
  site: string,
  title: string,
  url?: string,
  badges: EntityId[],
}

export type SiteName = string
export interface SqidSiteLink {
  l: string,
  i: number,
  u: string,
  g: string,
}

export type SiteLinkMap = Map<SiteName, SqidSiteLink>

export interface SqidStatement {
  item: EntityId,
  statement: StatementId,
  property: EntityId,
  rank: Rank,
}

export interface QualifiedEntityValue {
  value: EntityIdValue,
  qualifiers: Map<EntityId, Snak[]>,
  id: string,
}

export class MalformedEntityIdError extends Error {
  private entity: EntityId

  constructor(entityId: EntityId, description: string) {
    super(`EntityId ${entityId} is malformed: ${description}`)
    this.entity = entityId
  }

  public get entityId() {
    return this.entity
  }
}

export class EntityMissingError extends Error { // tslint:disable-line:max-classes-per-file
  private entity: EntityId

  constructor(entityId: EntityId) {
    super(`Entity ${entityId} does not exist`)
    this.entity = entityId
  }

  public get entityId() {
    return this.entity
  }
}
