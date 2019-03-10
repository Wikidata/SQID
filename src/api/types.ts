export interface ApiResult {
  batchcomplete: string,
  query?: QueryResult,
}

export interface ResultList<T> {
  [key: string]: T
}

export interface QueryResult {
  pages: ResultList<PageResult>
}

export type PageResult = ImagePageResult

export interface ImagePageResult {
  ns: number,
  title: string,
  missing: string,
  known: string,
  imagerepository: string,
  imageinfo?: ImageInfo[],
}

export interface ImageInfo {
  size: number,
  width: number,
  height: number,
  thumburl: string,
  thumbwidth: number,
  thumbheight: number,
  url: string,
  descriptionurl: string,
  descriptionshorturl: string,
}
