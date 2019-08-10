import { EntityId } from '@/api/types'
import { RelatednessMapping } from '@/api/sqid'

export interface ClassStatistics {
  directInstances: number,
  directSubclasses: number,
  allInstances: number,
  allSubclasses: number,
  superClasses: EntityId[],
  nonemptySubClasses: EntityId[],
  relatedProperties: EntityId[],
}

export interface ClassesState {
  hierarchy: Map<EntityId, ClassStatistics>,
  hierarchyRefreshed: Date,
  cachedHierarchyRefresh: number,
}
