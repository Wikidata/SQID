<template>
  <sqid-bars>
    <template #mainbar>
      <h1>{{ t('errors.underConstruction') }}</h1>
      <i18n-t tag="div" keypath="errors.underConstructionDescription">
        <template #sqid
          ><a href="https://tools.wmflabs.org/sqid/">{{ t('errors.legacySqid') }}</a>
        </template>
      </i18n-t>
    </template>
    <template #sidebar>
      <sqid-image file="Argonauta nodosa lithograph.jpg" :width="260" />
    </template>
  </sqid-bars>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
