import { acceptHMRUpdate, defineStore } from 'pinia'

import type { EntityId } from '@/api/types'

type Store = ReturnType<typeof useEntitiesStore>

export const useEntitiesStore = defineStore('entities', () => {
  function $reset(this: Store) {
    // todo(mx): implement this
  }

  async function getPropertyDatatypes(this: Store, _propertyIds: [EntityId]) {
    // todo(mx): implement this
    return {
      get: (_id: EntityId) => 'unknown',
    }
  }

  return {
    $reset,

    getPropertyDatatypes,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEntitiesStore, import.meta.hot))
}
