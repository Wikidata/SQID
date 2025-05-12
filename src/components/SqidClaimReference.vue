<template>
  <div>
    <strong>{{ t('entity.reference') }}</strong>
    <table>
      <tr v-for="propertyId in reference['snaks-order']" :key="propertyId">
        <td><sqid-entity-link :entity-id="propertyId" /></td>
        <td>
          <sqid-snak
            v-for="(snak, snakId) in reference.snaks[propertyId]"
            :key="snakId"
            :snak="snak"
          />
        </td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Reference } from '@/api/types'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{ reference: Reference }>()
</script>

<style scoped>
table {
  font-size: 90%;
  table-layout: fixed;
}

table td {
  padding-left: 5px;
  padding-top: 1px;
  padding-bottom: 1px;
  min-width: 25%;
}

table th {
  padding-top: 7px;
  padding-bottom: 3px;
  width: 100%;
  color: #555;
}
</style>
