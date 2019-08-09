import { EntityId } from '@/api/types'

export enum PropertyClassification {
  Ids = 'i',
  Family = 'f',
  Media = 'm',
  Wiki = 'w',
  Other = 'o',
  Hierarchy = 'h',
}

export interface PropertiesState {
  propertyGroups: object,       // todo(mx): this should be a map, but that breaks vue-devtools
  propertiesByGroup: Map<PropertyClassification, EntityId[]>,
  classificationRefreshed: Date,
  relatedPropertiesRefreshed: Date,
  cachedRelatedPropertiesRefresh: number,
  count: number,
  countLabels: number,
  countStatements: number,
  countDescriptions: number,
  countAliases: number,
}
