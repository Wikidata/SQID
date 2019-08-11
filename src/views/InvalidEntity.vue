<template>
  <sqid-bars>
    <template v-slot:mainbar>
      <h1>
        <i18n path="errors.invalidEntity">
          <span place="entityId">{{ id }}</span>
          </i18n>
        </h1>
      <i18n tag="div" path="errors.invalidEntityDescription">
        <span place="entityId">{{ id }}</span>
        <span place="error">{{ error }}</span>
      </i18n>
      </template>
    <template v-slot:sidebar>
      <sqid-image file="Colossal octopus by Pierre Denys de Montfort.jpg" width="260" />
    </template>
  </sqid-bars>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { parseEntityId } from '@/api/wikidata'
import { EntityId } from '@/api/types'

@Component
export default class NotFoundView extends Vue {
  @Prop({ required: true }) protected readonly id!: string
  private error: string | null = null

  private created() {
    try {
      parseEntityId(this.id)
    } catch (err) {
      this.error = err.message
    }
  }
}
</script>
