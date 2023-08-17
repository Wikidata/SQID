import { computed, ref } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'

import { wikidataUrl } from '@/api/wikidata'

type Store = ReturnType<typeof useI18nStore>

export const useI18nStore = defineStore('entities-claims', () => {
  const entityUrl = computed(() => wikidataUrl) // todo(mx): pass lang if lang had been set from request URI

  return { entityUrl }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useI18nStore, import.meta.hot))
}
