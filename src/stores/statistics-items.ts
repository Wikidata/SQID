import { computed, ref } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'

import type { Claim, EntityId } from '@/api/types'

export type ClaimsMap = Map<EntityId, Claim[]>

export const useStatisticsItemsStore = defineStore('statistics-items', () => {
  const claims = ref<ClaimsMap>(new Map())

  const count = ref(0)
  const countStatements = ref(0)
  const countLabels = ref(0)
  const countDescriptions = ref(0)
  const countAliases = ref(0)

  const claimsFor = computed(() => claims.value.get)

  function $reset() {
    claims.value = new Map()
    count.value = 0
    countStatements.value = 0
    countLabels.value = 0
    countDescriptions.value = 0
    countAliases.value = 0
  }

  return {
    claims,
    count,
    countStatements,
    countLabels,
    countDescriptions,
    countAliases,

    claimsFor,

    $reset,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStatisticsItemsStore, import.meta.hot))
}
