<template>
  <span>
    <template v-if="snaktype === 'value'">
      <data-value :value="snak.datavalue"
                  :propertyId="snak.property"
                  :short="short" />
    </template>
    <template v-else-if="snaktype === 'somevalue'">{{ $t('entity.someValue') }}</template>
    <template v-else-if="snaktype === 'novalue'">{{ $t('entity.noValue') }}</template>
    <template v-else>unknown snaktype</template>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Snak as SnakData } from '@/api/types'

@Component
export default class SnakValue extends Vue {
  @Prop({ required: true }) private snak!: SnakData
  @Prop({ default: false, type: Boolean }) private short!: boolean

  private get snaktype() {
    return this.snak.snaktype
  }
}
</script>

<style lang="less" scoped>
span.deprecated {
  text-decoration: line-through;
}
</style>
