<template>
  <sqid-bars>
    <template v-slot:mainbar>
      <i18n tag="h1" path="errors.underConstruction" />
      <i18n tag="div" path="errors.underConstructionDescription">
        <a place="sqid" href="https://tools.wmflabs.org/sqid/">SQID 1.0</a>
      </i18n>
    </template>
    <template v-slot:sidebar>
      <sqid-image file="Argonauta nodosa lithograph.jpg" width="260" />
    </template>
  </sqid-bars>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class ConstructionView extends Vue {
}
</script>
