<template>
<span>
    <template v-if="snaktype === 'value'"><data-value :value="snak.datavalue" /></template>
    <template v-else-if="snaktype === 'somevalue'">some value</template>
    <template v-else-if="snaktype === 'novalue'">no value</template>
    <template v-else>unknown snaktype</template>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Snak as SnakData } from '@/api/types'

@Component
export default class SnakValue extends Vue {
  @Prop() private snak!: SnakData

  private get snaktype() {
    return this.snak.snaktype
  }
}
</script>
