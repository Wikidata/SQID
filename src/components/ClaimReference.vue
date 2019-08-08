<template>
  <div>
    <strong>Reference</strong>
    <table>
      <tr v-for="propertyId in reference['snaks-order']" :key="propertyId">
        <td><entity-link :entityId="propertyId" /></td>
        <td><snak v-for="(snak, snakId) in reference.snaks[propertyId]" :key="snakId" :snak="snak" /></td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Reference } from '@/api/types'

@Component
export default class ClaimReference extends Vue {
  @Prop({ required: true }) private reference!: Reference
}
</script>

<style lang="less" scoped>
table {
  font-size: 90%;
  table-layout: fixed;

  td {
    padding-left: 5px;
    padding-top: 1px;
    padding-bottom: 1px;
    min-width: 25%;
  }

  th {
    padding-top: 7px;
    padding-bottom: 3px;
    width: 100%;
    color: #555;
  }
}
</style>
