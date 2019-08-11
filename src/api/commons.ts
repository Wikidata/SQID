import { ImagePageResult, ImageInfo, MWApiResult } from './types'
import { apiRequest } from './index'
import { commonsEndpoint } from './endpoints'

export async function getImageData(fileName: string, width?: number): Promise<ImageInfo> {
  const response = await apiRequest(commonsEndpoint, {
    action: 'query',
    prop: 'imageinfo',
    titles: `File:${fileName}`,
    iiprop: 'size|url',
    iiurlwidth: width,
  }) as MWApiResult

  const keys = Object.keys(response!.query!.pages!)
  const page = response!.query!.pages[keys[0]] as ImagePageResult
  return page!.imageinfo![0]
}
