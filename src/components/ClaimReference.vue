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
  @Prop() private reference!: Reference
}
</script>
