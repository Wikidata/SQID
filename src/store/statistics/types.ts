import { SiteName, SqidSiteLink, SiteLinkMap } from '@/api/types'
export { SiteName, SqidSiteLink, SiteLinkMap }

export interface StatisticsDates {
  dumpDate: Date,
  classUpdate: Date,
  propertyUpdate: Date,
}

export interface StatisticsSites {
  siteLinkCount: number,
  sites: SiteLinkMap,
}

export interface StatisticsState  {
  dumpDate: Date,
  classesDate: Date,
  propertiesDate: Date,
  refreshedDate: Date,
  sitelinks: number,
  sites: SiteLinkMap,
}
