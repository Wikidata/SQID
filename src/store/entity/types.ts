import { EntityId, EntitySiteLink, WBDatatype } from '@/api/types'
export { EntityId, EntitySiteLink, WBDatatype }

export interface EntityState {
  timestamps: Map<EntityId, Date>,
  sitelinks: Map<EntityId, Map<string, EntitySiteLink>>,
  datatypes: { [key: string]: WBDatatype },
}
