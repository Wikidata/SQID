import { EntityId, EntitySiteLink } from '@/api/types'
export { EntityId, EntitySiteLink }

export interface EntityState {
  timestamps: Map<EntityId, Date>,
  sitelinks: Map<EntityId, Map<string, EntitySiteLink>>
}
