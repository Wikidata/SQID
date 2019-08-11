<template>
  <a :href="descriptionUrl" target="_blank">
    <img :src="thumbUrl" />
  </a>
</template>

<style scoped>
img {
  display: block;
  margin-left: auto;
  margin-right: auto;
}
</style>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { getImageData } from '@/api/commons'
import { ImageInfo } from '@/api/types'

@Component
export default class SqidImage extends Vue {
  @Prop({ required: true }) private file!: string
  @Prop({ required: true }) private width!: number

  private imageInfo: ImageInfo | null = null

  private get descriptionUrl() {
    if (this.imageInfo !== null) {
      return this.imageInfo.descriptionurl
    }
    return undefined
  }

  private get thumbUrl() {
    if (this.imageInfo !== null) {
      if (this.imageInfo.thumburl !== undefined) {
        return this.imageInfo.thumburl
      }
      return this.imageInfo.url
    }
    return undefined
  }

  private created() {
    getImageData(this.file, this.width).then((info) => this.imageInfo = info)
  }
}
</script>
