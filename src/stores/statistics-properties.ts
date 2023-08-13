import { ref } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'

import type { Claim, EntityId } from '@/api/types'

export type ClaimsMap = Map<EntityId, Claim[]>

type Store = ReturnType<typeof useStatisticsPropertiesStore>

export const useStatisticsPropertiesStore = defineStore('statistics-properties', () => {
  const claims = ref<ClaimsMap>(new Map())

  async function getUrlPattern(
    //this: Store,
    propertyId: EntityId,
  ): Promise<string | undefined> {
    return // todo(mx): implement this
  }

  async function getPropertyDatatypes(
    //this: Store,
    propertyIds: EntityId[],
  ): Promise<Map<EntityId, string> | undefined> {
    return // todo(mx): implement this
  }

  return { claims, getUrlPattern, getPropertyDatatypes }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStatisticsPropertiesStore, import.meta.hot))
}
