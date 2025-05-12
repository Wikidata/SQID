import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'

export interface Updates {
  dump: Date
  classes: Date
  properties: Date
}

type Store = ReturnType<typeof useUpdatesStore>

export const useUpdatesStore = defineStore('updates', () => {
  const dump = ref(new Date(0))
  const classes = ref(new Date(0))
  const properties = ref(new Date(0))

  function $reset() {}

  return {
    dump,
    classes,
    properties,

    $reset,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUpdatesStore, import.meta.hot))
}
