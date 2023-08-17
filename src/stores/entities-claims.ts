import { computed, ref } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'

import type { Claim, EntityId } from '@/api/types'

export type ClaimsMap = Map<EntityId, Claim[]>

type Store = ReturnType<typeof useEntitiesClaimsStore>

export const useEntitiesClaimsStore = defineStore('entities-claims', () => {
  const claims = ref<ClaimsMap>(new Map())

  return { claims }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEntitiesClaimsStore, import.meta.hot))
}
