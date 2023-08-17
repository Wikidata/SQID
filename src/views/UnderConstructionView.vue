<template>
  <sqid-bars>
    <template #mainbar>
      <h1 v-t="'errors.underConstruction'" />
      <i18n-t tag="div" keypath="errors.underConstructionDescription">
        <template #sqid><a href="https://tools.wmflabs.org/sqid/">SQID 1.0</a></template>
      </i18n-t>
    </template>
    <template #sidebar>
      <sqid-image file="Argonauta nodosa lithograph.jpg" :width="260" />
    </template>
  </sqid-bars>
</template>
