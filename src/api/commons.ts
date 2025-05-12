import type { ImagePageResult, MWApiResult, ImageResult } from './types'
import { apiRequest } from './index'
import { commonsEndpoint } from './endpoints'
import { getLabels } from './wikidata'
import { i18n } from '@/i18n'
import type { ImageLabels } from './types'

export async function getImageData(
  fileName: string,
  width?: number,
  lang?: string,
): Promise<ImageResult> {
  const response = (await apiRequest(commonsEndpoint, {
    action: 'query',
    prop: 'imageinfo',
    titles: `File:${fileName}`,
    iiprop: 'size|url',
    iiurlwidth: width,
  })) as MWApiResult

  const keys = Object.keys(response!.query!.pages!)
  const page = response!.query!.pages[keys[0]] as ImagePageResult
  const entityId = `M${page.pageid}`
  const langCode = lang ?? i18n.global.locale.value
  const labelData = await getLabels([entityId], langCode, true, commonsEndpoint)

  const labels: ImageLabels = {}

  for (const [language, languageLabels] of labelData) {
    const label = languageLabels.get(entityId) ?? entityId

    if (label !== entityId) {
      labels[language] = label
    }
  }

  return {
    entityId,
    labels,
    imageInfo: page!.imageinfo![0],
  }
}
