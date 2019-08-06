export type EntityId = string
export type LangCode = string
export type TermsMap = Map<EntityId, string>
export type MultilingualTermsMap = Map<LangCode, TermsMap>
export type InflightTermsMap = Map<EntityId, Promise<string>>
export type MultilingualInflightMap = Map<LangCode, InflightTermsMap>

export interface TermsState {
  labels: MultilingualTermsMap
  aliases: MultilingualTermsMap
  descriptions: MultilingualTermsMap
  inflightTerms: MultilingualInflightMap
  inflightLabels: MultilingualInflightMap
}

export interface LabelOptions {
  entityId: EntityId,
  lang: LangCode | null,
}

export interface LabelsOptions {
  entityIds: EntityId[],
  lang: LangCode | null,
}
