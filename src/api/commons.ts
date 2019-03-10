import { ImagePageResult, ImageInfo } from './types'
import { apiRequest } from './index'

const commonsEndpoint = 'https://commons.wikimedia.org/w/api.php'

export { ImageInfo } from './types'

export async function getImageData(fileName: string, width?: number): Promise<ImageInfo> {
  const response = await apiRequest(commonsEndpoint, {
    action: 'query',
    prop: 'imageinfo',
    titles: `File:${fileName}`,
    iiprop: 'size|url',
    iiurlwidth: width,
  })

  const keys = Object.keys(response!.query!.pages!)
  const page = response!.query!.pages[keys[0]] as ImagePageResult
  return page!.imageinfo![0]
}
