import { computed, ref } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'

import type { SiteLinkMap } from '@/api/types'
import { getStatistics, shouldRefresh } from '@/api/sqid'

export interface StatisticsDates {
  dumpDate: Date
  classUpdate: Date
  propertyUpdate: Date
}

export interface StatisticsSites {
  siteLinkCount: number
  sites: SiteLinkMap
}

type Store = ReturnType<typeof useStatisticsStore>

function shouldCheckForUpdate(store: Store) {
  const now = new Date().getTime()
  const lastUpdate = Math.max(
    store.dumpDate.getTime(),
    store.classesDate.getTime(),
    store.propertiesDate.getTime(),
  )
  const timeSinceLastRefresh = now - store.refreshedDate.getTime()
  const timeSinceLastUpdate = now - lastUpdate

  return shouldRefresh(timeSinceLastRefresh, timeSinceLastUpdate)
}

export const useStatisticsStore = defineStore('statistics', () => {
  const dumpDate = ref(new Date(0))
  const classesDate = ref(new Date(0))
  const refreshedDate = ref(new Date(0))
  const propertiesDate = ref(new Date(0))
  const sitelinks = ref(0)
  const sites = ref<SiteLinkMap>(new Map())

  const siteLinkUrl = computed(() => (wikiname: string) => sites.value.get(wikiname)?.u)

  function $reset(this: Store) {
    this.$patch({
      dumpDate: new Date(0),
      classesDate: new Date(0),
      refreshedDate: new Date(0),
      propertiesDate: new Date(0),
      sitelinks: new Date(0),
      sites: new Map(),
    })
  }

  async function refresh(this: Store) {
    if (!shouldCheckForUpdate(this)) {
      return
    }

    const response = await getStatistics(this.refreshedDate.getTime())

    const dumpDate = Date.parse(response.dumpDate)
    const classesDate = Date.parse(response.classUpdate)
    const propertiesDate = Date.parse(response.propertyUpdate)

    if (
      dumpDate > this.dumpDate.getTime() ||
      classesDate > this.classesDate.getTime() ||
      propertiesDate > this.propertiesDate.getTime()
    ) {
      // have new data, update everything
      this.$patch({
        dumpDate,
        classesDate,
        refreshedDate: new Date(),
        propertiesDate,
        sitelinks: response.siteLinkCount,
        sites: new Map(Object.entries(response.sites)),
      })
    } else {
      // no new data, just record last tried refresh
      this.refreshedDate = new Date()
    }
  }

  return {
    dumpDate,
    classesDate,
    refreshedDate,
    propertiesDate,
    sitelinks,
    sites,

    siteLinkUrl,

    $reset,
    refresh,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStatisticsStore, import.meta.hot))
}
