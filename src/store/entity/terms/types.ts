type EntityId = string
type LangCode = string
export type TermsMap = Map<EntityId, string>
export type MultilingualTermsMap = Map<LangCode, TermsMap>

export interface TermsState {
  labels: MultilingualTermsMap
  aliases: MultilingualTermsMap
  descriptions: MultilingualTermsMap
}
