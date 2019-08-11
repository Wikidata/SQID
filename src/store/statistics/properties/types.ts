import { EntityId } from '@/api/types'

export enum PropertyClassification {
  Ids = 'i',
  Family = 'f',
  Media = 'm',
  Wiki = 'w',
  Other = 'o',
  Hierarchy = 'h',
}

export interface PropertyStatistics {
  items: number,
  statements: number,
  inQualifiers: number,
  inReferences: number,
  qualifiers: Map<EntityId, number>,
  classes: EntityId[],
}

export interface PropertiesState {
  // todo(mx): this should be a map, but that breaks vue-devtools
  propertyGroups: { [key: string]: PropertyClassification },
  propertiesByGroup: Map<PropertyClassification, EntityId[]>,
  classificationRefreshed: Date,
  relatedPropertiesRefreshed: Date,
  urlPatternsRefreshed: Date,
  usageRefreshed: Date,
  cachedRelatedPropertiesRefresh: number,
  count: number,
  countLabels: number,
  countStatements: number,
  countDescriptions: number,
  countAliases: number,
  urlPatterns: Map<EntityId, string>,
  usage: { [key: string]: PropertyStatistics },
}
