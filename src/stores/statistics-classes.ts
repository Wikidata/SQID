import { ref } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'

import type { Claim, EntityId } from '@/api/types'

export interface ClassStatistics {
  directInstances: number
  directSubclasses: number
  allInstances: number
  allSubclasses: number
  superClasses: Array<EntityId>
  nonemptySubClasses: Array<EntityId>
  relatedProperties: Array<EntityId>
}

export type ClassStatisticsMap = Map<EntityId, ClassStatistics>

type Store = ReturnType<typeof useStatisticsClassesStore>

export const useStatisticsClassesStore = defineStore('statistics-properties', () => {
  const hierarchy = ref<ClassStatisticsMap>(new Map())
  const hierarchyRefreshed = ref(new Date(0))

  return { hierarchy, hierarchyRefreshed }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStatisticsClassesStore, import.meta.hot))
}
