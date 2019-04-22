type EntityId = string
type LangCode = string
type TermsMap = Map<EntityId, string>
type MultilingualTermsMap = Map<LangCode, TermsMap>

export interface TermsState {
  labels: MultilingualTermsMap
}
