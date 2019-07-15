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
  type: EntityKind
  id: EntityId
  labels?: ResultList<TermResult>
  descriptions?: ResultList<TermResult>
  aliases?: ResultList<TermResult>
  claims?: ResultList<Claim>
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
  references: Reference[]
}

export type SnakType = 'value'
export type WBDatatype = 'wikibase-item'

export interface Snak {
  snaktype: SnakType
  property: EntityId
  hash: string
  datavalue: Datavalue
  datatype: WBDatatype
}

export type DatavalueKind = 'wikibase-entityid' | 'time' | 'string'

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

export interface TimeDataValue extends Datavalue { // todo(mx): fix this
  type: 'time'
  value: TimeValue
}

export interface TimeValue {
  time: string
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
export interface EntityReference {
  id: number
  kind: EntityKind
}
