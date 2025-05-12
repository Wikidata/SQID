<template>
  <a :href="descriptionUrl" target="_blank">
    <img :src="thumbUrl" :alt="description" :title="t('image.description', { description })" />
  </a>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { getImageData } from '@/api/commons'
import type { ImageResult } from '@/api/types'
import { useI18n } from 'vue-i18n'
import { FALLBACK_LOCALE } from '@/i18n'

const props = defineProps<{
  file: string
  width: number
}>()

const i18n = useI18n()
const { t } = i18n

const imageData = ref<ImageResult | null>(null)

const description = computed(() => {
  const locale = i18n.locale.value

  return (
    imageData.value?.labels[locale] ??
    imageData.value?.labels[FALLBACK_LOCALE] ??
    i18n.t('image.missingImageDescription', { entityId: imageData.value?.entityId })
  )
})
const descriptionUrl = computed(() => imageData.value?.imageInfo.descriptionurl)
const thumbUrl = computed(
  () => imageData.value?.imageInfo.thumburl ?? imageData.value?.imageInfo.url,
)

watchEffect(async () => {
  imageData.value = await getImageData(props.file, props.width)
})
</script>

<style scoped>
img {
  display: block;
  margin-left: auto;
  margin-right: auto;
}
</style>
