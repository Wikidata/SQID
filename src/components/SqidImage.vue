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

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { getImageData } from '@/api/commons'
import type { ImageInfo } from '@/api/types'

const props = defineProps<{
  file: string
  width: number
}>()

const imageInfo = ref<ImageInfo | null>(null)

const descriptionUrl = computed(() => imageInfo.value?.descriptionurl)
const thumbUrl = computed(() => imageInfo.value?.thumburl ?? imageInfo.value?.url)

watchEffect(async () => {
  imageInfo.value = await getImageData(props.file, props.width)
})
</script>
