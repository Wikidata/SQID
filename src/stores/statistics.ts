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
    store.dumpTimestamp,
    store.classesTimestamp,
    store.propertiesTimestamp,
  )
  const timeSinceLastRefresh = now - store.lastRefresh
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

  const dumpTimestamp = computed(() => dumpDate.value.getTime())
  const classesTimestamp = computed(() => classesDate.value.getTime())
  const propertiesTimestamp = computed(() => propertiesDate.value.getTime())
  const lastRefresh = computed(() => refreshedDate.value.getTime())

  const siteLinkUrl = computed(() => (wikiname: string) => sites.value.get(wikiname)?.u)

  async function refresh(this: Store) {
    if (!shouldCheckForUpdate(this)) {
      return
    }

    const response = await getStatistics(this.lastRefresh)

    const dumpDate = Date.parse(response.dumpDate)
    const classesDate = Date.parse(response.classUpdate)
    const propertiesDate = Date.parse(response.propertyUpdate)

    if (
      dumpDate > this.dumpTimestamp ||
      classesDate > this.classesTimestamp ||
      propertiesDate > this.propertiesTimestamp
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

    dumpTimestamp,
    classesTimestamp,
    propertiesTimestamp,
    lastRefresh,
    siteLinkUrl,

    refresh,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStatisticsStore, import.meta.hot))
}
