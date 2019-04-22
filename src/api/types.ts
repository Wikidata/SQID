export interface ApiResult {
  batchcomplete?: string
  success?: number
}

export interface MWApiResult extends ApiResult {
  query?: QueryResult
}

export interface WBApiResult extends ApiResult {
  entities?: ResultList<EntityResult>
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
}

export interface TermResult {
  language: string
  value: string
}

export type EntityKind = 'item' | 'property'
export type EntityId = string
export interface EntityReference {
  id: number
  kind: EntityKind
}
