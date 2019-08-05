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
  propertyGroups: Map<EntityId, PropertyClassification>,
  propertiesByGroup: Map<PropertyClassification, EntityId[]>,
  classificationRefreshed: Date,
  count: number,
  countLabels: number,
  countStatements: number,
  countDescriptions: number,
  countAliases: number,
}
